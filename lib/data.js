/* jshint esversion:6 */

var fs = require('fs');
var path = require('path');

const always_suppress = {
    'uc_authors': 1,
    'claimed_by': 1,
    'awaiting_claim_by': 1,
    'claimed_by_alt': 1,
    'awaiting_claim_by_alt': 1,
};

var helpers = require('./helpers.js');

var Data = function(cfg) {
    this.cfg = cfg;
    var tthis = this;
    this.db = {};
    this.fstats = {};
    this.acls = {};
};

Data.prototype.init = function(cb) {
    this._load();
    this._combine();
    return cb();
};

Data.prototype._load= function() {
    Object.keys(this.cfg.load).forEach((dname) => {
        var dcfg = this.cfg.load[dname];
        if (dcfg.disable) return;
        console.debug(dcfg);
        this.db[dname] = {};
        this.db[dname].raw = require(dcfg.file);
        this.fstats[dname] = fs.statSync(path.resolve('scout', dcfg.file));
        this.acls[dname] = {};
        this.acls[dname].raw = 'none';

        if (dcfg.transformRaw && Array.isArray(dcfg.transformRaw)) {
            dcfg.transformRaw.forEach((fn) => {
                fn(this.db[dname].raw);
            });
        }

        if (dcfg.variations && Array.isArray(dcfg.variations)) {
            dcfg.variations.forEach((variation) => {
                var nd = variation.fn(this.db[dname].raw);
                this.db[dname][variation.name] = nd;
                var acl = variation.acl || 'none';
                this.acls[dname][variation.name] = acl;
            });
        }
    });
};

Data.prototype._combine = function() {
    this.cfg.combine.forEach((cmbcfg) => {
        if (cmbcfg.disable) return;
        console.debug(cmbcfg);
        var inputs = [];
        cmbcfg.inputs.forEach((inpcfg) => {
            var input = this.db[ inpcfg.name ][ inpcfg.variation ];
            inputs.push(input);
        });
        var result = cmbcfg.fn.apply(null, inputs);
        if (cmbcfg.output) {
            if (!this.db[cmbcfg.output.name]) {
                this.db[cmbcfg.output.name] = {};
                this.acls[cmbcfg.output.name] = {};
            }
            var acl = cmbcfg.output.acl || 'none';
            this.db[ cmbcfg.output.name ][ cmbcfg.output.variation ] = result;
            this.acls[ cmbcfg.output.name ][ cmbcfg.output.variation ] = acl;
        }
    });
};

Data.prototype.stats = function() {
    return this.fstats;
};


Data.prototype.query = function(name, variation, keyval, extras, cb) {
    console.debug('query: ',name,' >> ',variation,' >> ',keyval);
    if (!this.db[name]) 
        return cb('no_such_table_class');
    if (!this.db[name][variation]) 
        return cb('no_such_table_variation');
    if (!this.acls[name]) 
        return cb('missing_acl_dict');
    if (!this.acls[name][variation]) 
        return cb('missing_acl');
    if (this.acls[name][variation] == 'none') 
        return cb('acl_no_permission');
    if (!keyval && (this.acls[name][variation] == 'key')) 
        return cb('acl_keys_only');
    if (keyval && !this.db[name][variation][keyval]) 
        return cb('no_such_keyval_in_table');
     
    var prefiltered = [];
    if (!keyval) {
        prefiltered = Object.values(this.db[name][variation]);
    } else {
        prefiltered = this.db[name][variation][keyval];
    }

    // insane hack here. There is no real way to tell the difference 
    // between the hash of the "item" we're interested in and a hash
    // of itemids pointing to items. So we play a bit and assume that
    // if all the keys are numbers, they are ids and it's the latter case.
    if (helpers.isDict(prefiltered)) {
        var l0_keys = Object.keys(prefiltered);
        var look_like_ids = true;
        l0_keys.forEach((l0_key) => {
            look_like_ids &= (l0_key.match(/^\d+$/) !== null);
        });
        if (look_like_ids) {
            prefiltered = Object.values(prefiltered);
        } else {
            prefiltered = [ prefiltered ];
        }
    }

    var filtered = prefiltered;
    if (extras) {
        console.debug('filtering',extras);
        filtered = [];
        var re_cache = {};
        Object.keys(extras).forEach((k) => {
            if (extras[k][0] == 're') {
                re_cache[extras[k][1]] = new RegExp(extras[k][1],'g');
            }
        });
        prefiltered.forEach((elem) => {
            var match = true;
            Object.keys(extras).forEach((k) => {
                var is_defined = elem[k] !== undefined;
                var is_nonnull = elem[k] !== null;

                switch (extras[k][0]) {
                    case 'eq': 
                        match &= is_defined && (elem[k] == extras[k][1]); 
                        break;
                    case 'ne': 
                        match &= elem[k] != extras[k][1]; 
                        break;
                    case 'nonnull_ne':
                        match &= is_nonnull && 
                            is_defined && (elem[k] != extras[k][1]); 
                        break;
                    case 'nonnull_gte':
                        match &= is_nonnull && is_defined &&
                            (elem[k] >= extras[k][1]);
                        break;
                    case 'nonnull_gte_date':
                        match &= is_nonnull && is_defined &&
                            (new Date(elem[k]) >= new Date(extras[k][1]));
                        break;
                    case 'nonnull_range_date':
                        match &= is_nonnull && is_defined &&
                            (new Date(elem[k]) >= new Date(extras[k][1])) &&
                            (new Date(elem[k]) <= new Date(extras[k][2]));
                        break;
                    case 're': 
                        match &= elem[k].match(re_cache[extras[k][1]]); 
                        break;
                    case 'nullzero': 
                        match &= !is_nonnull || (!elem[k]);
                        break;
                    case 'nonnull':  
                        match &= (elem[k] !== undefined) && 
                                 (elem[k] !== null); 
                        break;
                    default:
                }
            });
            if (match) filtered.push(elem);
        });
    }
    return cb(null, this.copyButStrip(filtered,always_suppress));
};

Data.prototype.copyButStrip = function(src,skip) {
    if (Array.isArray(src)) {
        var dst = [];
        src.forEach((srcelem) => {
            dstelem = {};
            Object.keys(srcelem).forEach((srckey) => {
                if (srckey in skip) {
                } else {
                    dstelem[srckey] = srcelem[srckey];
                }
            });
            dst.push(dstelem);
        });
        return dst;
    } else {
        return src;
    }
};

Data.prototype.showRaw = function(w) {
    if (this.db[w] && this.db[w].raw) console.debug(this.db[w].raw);
    else console.error(w + ' not defined');
};

Data.prototype.save = function(fname) {
    fs = require('fs');
    fs.writeFileSync(fname, JSON.stringify(this.db,null,2));
};

module.exports = Data;

