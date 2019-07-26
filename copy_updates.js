/* jshint esversion:6 */

var fs = require('fs');
var path = require('path');

var config = {
    src_folder: './db/staging',
    dst_folder: './db',
    files_to_check: [
        'appointments.json',
        'area_info.json',
        'certifications.json',
        'degrees.json',
        'division_info.json',
        'hrdata.json',
        'nonacademic_jobs.json',
        'osti.json',
        'profas.json',
        'pubs.json',
        'unclaimed.json',
        'users.json',
        'websites.json',
    ],
};

var checkFile = function(srcp, dstp, fn) {
    var srcfn = path.resolve(srcp,fn);
    var dstfn = path.resolve(dstp,fn);
    var src_exists = fs.existsSync(srcfn);
    var dst_exists = fs.existsSync(dstfn);
    var srcstats = null;
    var dststats = null;
    if (src_exists) srcstats = fs.statSync(srcfn);
    if (dst_exists) dststats = fs.statSync(dstfn);
    var src_newer = src_exists && dst_exists && (srcstats.mtime > dststats.mtime);
    var src_looks_legit = src_exists && srcstats.size > 200;
    if ((src_newer || !dst_exists) && src_looks_legit) {
        console.log('Copying staged file: ' + srcfn);
        fs.copyFileSync(srcfn, dstfn);
    }
};

if (require.main === module) {
    config.files_to_check.forEach((fn) => {
        checkFile(config.src_folder, config.dst_folder, fn);
    });
}
