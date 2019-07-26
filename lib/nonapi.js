/* jshint esversion:6 */

var path = require('path');
var fs   = require('fs');

var nonAPI = function(cfg) { 
    this.config = cfg;
};

nonAPI.prototype.init = function(cb) {
    return cb();
};

nonAPI.prototype.fileMunger = function(fn, replacements, res) {
    fs.readFile(path.join(__dirname,'../static',fn), (err, data) => {
        if (err) {
            console.error(err);
            return '';
        }
        var nd = data.toString('utf8');
        replacements.forEach((rp) => {
            console.debug(rp);
            var re = new RegExp(rp[0],'g');
            nd = nd.replace(re,rp[1]);
        });
        res.send(nd);
    });
};

nonAPI.prototype.fileLoad = function(fn, res) {
    if (!this.fcache) this.fcache = {};

    if (false) {
        if (this.fcache[fn]) return res.send(this.fcache[fn]);
    }
    
    var tthis = this;
    fs.readFile(path.join(__dirname,'../static',fn), (err, data) => {
        if (err) {
            console.error(err);
            return '';
        }
        var nd = data.toString('utf8');
        tthis.fcache[fn] = nd;
        res.send(nd);
    });
};

nonAPI.prototype.setupRoutes = function(router) {
    router.get('/static/:name/', this.staticHandler.bind(this));

    // all things scout
    router.get('/scoutUser/:name/', (req, res) => {
        this.fileLoad('scout.html',res);
    });
    router.get('/scoutUser/', (req, res) => {
        this.fileLoad('scout.html',res);
    });
    router.get('/scoutArea/:name/', (req, res) => {
        this.fileLoad('scout.html',res);
    });
    router.get('/scoutArea/', (req, res) => {
        this.fileLoad('scout.html',res);
    });
    router.get('/scoutDivision/:name/', (req, res) => {
        this.fileLoad('scout.html',res);
    });
    router.get('/scoutDivision/', (req, res) => {
        this.fileLoad('scout.html',res);
    });
    router.get('/scoutAllDeposited/', (req, res) => {
        this.fileLoad('scout.html',res);
    });

    // all things profiles
    router.get('/user/:name/', (req, res) => {
        this.fileLoad('profile.html',res);
    });
    router.get('/division/:name/', (req, res) => {
        this.fileLoad('profile.html',res);
    });
    router.get('/area/:name/', (req, res) => {
        this.fileLoad('profile.html',res);
    });
    router.get('/kw/:name/', (req, res) => {
        this.fileLoad('profile.html',res);
    });
    router.get('/kw/', (req, res) => {
        this.fileLoad('profile.html',res);
    });
    router.get('/profiles/', (req, res) => {
        this.fileLoad('profile_top.html',res);
    });

    // system status
    router.get('/status/', (req, res) => {
        this.fileLoad('status.html',res);
    });
};

var splatFile = function(res, ttype, fn) {
    var complete = path.join(__dirname,'../lib',fn);
    res.sendFile(complete);
};

nonAPI.prototype.staticHandler = function(req, res) {
   var user = 'anyone';
   if (user) {
       var name = req.params.name.replace('/','');
       console.debug('handleStatic ' + name + ' (' + user + ')');
       if (this.config.real_files[name] || null) {
           var type = 'text/html';
           if (name.match(/\.js$/)) {
               type = 'text/javascript';
           } else if (name.match(/\.css$/)) {
               type = 'text/css';
           } else if (name.match(/\.wav$/)) {
               type = 'audio/wave';
           }
           splatFile(res,  type, '/../static/' + name);
       } else {
           res.status(404);
           res.json({message: 'never heard of that one.'});
       }
    } else {
        res.status(403);
        res.redirect(this.sp.getLoginURL());
    }
};

module.exports = nonAPI;

