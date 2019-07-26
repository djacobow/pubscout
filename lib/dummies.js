/* jshint esversion:6 */

var DummySP = function() {
};
DummySP.prototype.getUser = function(req) {
    return 'dgj';
};
var saveData = function(user, form_name, form_data, cb) {
    console.debug('user',user,'form_name',form_name);
    console.debug('form_data',JSON.stringify(form_data,null,2));
    return cb(null,form_data);
};
var loadData = function(user, form_name, formcfg, cb) {
    rv = {
        i0: 'This is an override from the load function.'
    };
    return cb(null,rv);
};

module.exports = {
    DummySP: DummySP,
    loadData: loadData,
    saveData: saveData,
};

