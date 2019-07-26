/* jshint esversion:6 */
var process  = require('process');
var FTPS     = require('ftps');
var fs       = require('fs');
var helpers  = require('./lib/helpers.js');

var conndata = {
    host: 'ftp://ftps.cdlib.org',
    retries: 2,
};


var extractEmailStart = function(email) {
    if (email) {
        var m = email.match(/^([\.\w-]+)@\w+\.\w+$/i);
        if (m) return m[1].toLowerCase();
    } 
    return null;
};

var replaceEmpIDsWithBetterAlternative = function(i) {
    var o = {};
    Object.keys(i).forEach((ik) => {
        var emp_id   = i[ik].EMPLOYEE_ID;
        var eppn     = extractEmailStart(i[ik].EPPN);
        var lblemail = extractEmailStart(i[ik].LBNL_EMAILID);
        // var gstemail = extractEmailStart(i[ik].GUEST_EMAILID);

        var new_id =
            eppn ? eppn :
            lblemail ? lblemail :
            // gstemail ? gstemail :
            helpers.obfuscateID(emp_id);

        i[ik].ID_WAS = i[ik].EMPLOYEE_ID;
        i[ik].EMPLOYEE_ID = new_id;
        o[new_id] = i[ik];
    });
    return o;
};

if (require.main === module) {
    var creds = require('./hrcreds.json');
    Object.keys(creds).forEach((k) => {
        conndata[k] = creds[k];
    });
    var ftps = new FTPS(conndata);
    ftps.raw('cat lbl_hr_feed.csv')
        .exec(function(execerr, result) {
            if (execerr) {
                console.error('lftp error');
                console.error(execerr);
                process.exit(-1);
            }
            if (result && result.data) {
                hr_data = helpers.csvToJS(result.data, 'EMPLOYEE_ID');
                helpers.fixSpecials(hr_data);
                helpers.fixOrgNames(hr_data);
                hr_data_obfus = replaceEmpIDsWithBetterAlternative(hr_data);

                fs.writeFileSync('./db/staging/hrdata.json',JSON.stringify(hr_data_obfus,null,2));
            }
        });
}

