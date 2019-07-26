/* jshint esversion:6 */

var process = require('process');
var fs      = require('fs');
var helpers = require('./lib/helpers.js');

var cfg = [
    [ 2019, './osti/fy2019.csv', ],
    [ 2018, './osti/fy2018.csv', ],
    [ 2017, './osti/fy2017.csv', ],
    [ 2016, './osti/fy2016.csv', ],

];


if (require.main === module) {
    odata = {};
    cfg.forEach((c) => {
        var year = c[0];
        console.log('Year',year);
        var ydata = helpers.csvToJS(fs.readFileSync(c[1]), 'DOI');
        Object.keys(ydata).forEach((doi) => {
            odata[doi] = {
                DOI: doi,
                osti_yr: year,
            };
        });
    });
    console.log('dumping osti json');
    fs.writeFileSync('./db/staging/osti.json',JSON.stringify(odata,null,2));
}
