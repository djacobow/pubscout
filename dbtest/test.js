/* jshint esversion:6 */


const config = {
    'db': {
        server: 'oapolicy.universityofcalifornia.edu',
        database: 'elements-cdl2-reporting',
        requestTimeout: 1000 * 60 * 15,
        options: {
            encrypt: true,
        },
    },
    queries: [
        { sql: './test.sql',       json: './test.json' },
    ],
};



const sql     = require('mssql');
const process = require('process');
const fs      = require('fs');
const async   = require('async');

if (require.main === module) {
    const dbcreds = require('./dbcreds.json');
    config.db.user     = dbcreds.prod.user;
    config.db.password = dbcreds.prod.pw;

    sql.connect(config.db, (err) => {
        if (err) {
            console.error(err);
            process.exit(-1);
        }

        async.eachSeries(config.queries, (item, icb) => {
            var query = fs.readFileSync(item.sql, 'utf-8');
            console.log('querying: ');
            console.log(JSON.stringify(item,null,2));
            new sql.Request().query(query, (qerr, result) => {
                if (qerr) {
                    console.error('Problem with query');
                    console.error(qerr);
                    return icb('query fail');
                }
                if (result) {
                    fs.writeFileSync(item.json, JSON.stringify(result.recordsets[0],null,2));
                    console.log(result);
                    console.log('query done');
                }
                return icb();
            });
        },
        (eerr) => {
            if (eerr) {
                console.error('One or more queries failed.');
            } else {
                console.log('queries done');
            }
            process.exit(0);
        });
    });
}
