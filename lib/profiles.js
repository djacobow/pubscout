/* jshint esversion:6 */

var Formalizer     = require('./formalizer.js');
var dummies        = require('./dummies.js');

var Profiles = function(cfg) {
    this.cfg = cfg;
    this.former = new Formalizer(
        cfg.forms, 
        new dummies.DummySP(), 
        dummies.saveDate, 
        dummies.loadData
    );
};

Profiles.prototype.setupRoutes = function(router) {
    this.former.setupRoutes(router);
};

Profiles.prototype.init = function(cb) {
    this.former.init(cb);
};

module.exports = Profiles;
