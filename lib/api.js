/* jshint esversion:6 */

var initDataModel = require('./data_elab.js');
var API = function() { };
var helpers = require('./helpers.js');
var KeyWordSearch = require('./kwsearch');

API.prototype.init = function(cb) {
    var tthis = this;
    initDataModel(function(err,model) {
        tthis.d = model;
        tthis.kwdb = new KeyWordSearch();
        tthis.kwdb.load(model.db.claimed.bypubid, (item) => {
            var title = item.title || '';
            var abstr = item.abstract || '';
            return title + ' ' + abstr;
        });
        return cb();
    });
};

API.prototype.setupRoutes = function(router) {
    router.get('/v1/query/:name/:variation', this.queryHandler.bind(this));
    router.get('/v1/proxy/phonebook/:email', this.pbHandler.bind(this));
    router.get('/v1/kwsearch',               this.kwHandler.bind(this));
    router.get('/v1/fstats',                 this.fstatshandler.bind(this));
};


API.prototype.fstatshandler = function(req, res) {
    return res.json({err:null,fstats:this.d.stats()});
};

API.prototype.kwHandler = function(req, res) {
    var q = req.query.q;
    var d = this.kwdb.lookup(q);

    var tthis = this;
    var pubids = Object.keys(d.matches);
    if (pubids.length) {
        helpers.doAsyncThings(Object.keys(d.matches),
            (pubid, cb) => {
                tthis.d.query('claimed','bypubid', pubid, null, (qerr,qres) => {
                    d.matches[pubid].pub = qres;
                    return cb(null,qres);
                });
            },
            () => {
                return res.json({err:null,result:d});
            }
        );
    } else {
        return res.json({err:null,result:{}});
    }
};

// this just proxies the phonebook. But we will cache a bit to avoid the 
// double transaction
API.prototype.pbHandler = function(req, res) {
    if (!this.pbcache) this.pbcache = {};
    var q = req.params.email || null;
    if (q) {
        if (this.pbcache && this.pbcache[q]) {
            return res.json({err:null,result:this.pbcache[q]});
        }

        var tthis = this;
        helpers.GetJS('http://phonebook.lbl.gov/api/v1/search/people/'+q, (ferr,fres) => {
            var looks_good = !ferr && fres && (fres.result_count == 1);
            if (looks_good) {
                tthis.pbcache[q] = fres.results[0];
                return res.json({err:null,result:fres.results[0]});
            } else {
                return res.json({err:ferr});
            }
        });
    } else {
        res.json({err:'no_query'});
    }
};

API.prototype.queryHandler = function(req, res) {
    var q       = req.query.q || null;
    var extras  = req.query.extras || null;
    var name    = req.params.name;
    var variation = req.params.variation;

    if (extras) {
        try {
            extras = JSON.parse(extras);
        } catch (ex) {
            return res.json(403, {err:ex});
        }
    }
    this.d.query(name, variation, q, extras, function(qerr, qres) {
        if (qerr) {
            console.error(qerr);
            if (qerr == 'no_such_keyval_in_table') res.status(204);
            else res.status(403);
        }
        res.json({err:qerr,result:qres});
    });
};

if (false) {
    var d = DataModel();
    d.query('claimed', 'byuserid', '006651', { deposited: ['ne', 1] }, function(err,res) {
        if (err) console.error(err);
        if (res) console.debug(res);
    });
}

module.exports = API;

