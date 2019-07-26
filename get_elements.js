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
/*
        { sql: './sql/test.sql',
            json: './db/staging/test.json' },
*/
        { sql: './sql/pub_report.sql',
            json: './db/staging/pubs.json' },
        { sql: './sql/unclaimed_report.sql',
            json: './db/staging/unclaimed.json' },
        { sql: './sql/user_report.sql',
            json: './db/staging/users.json' },
        { sql: './sql/professional_activities.sql', 
            json: './db/staging/profas.json' },
        { sql: './sql/degrees.sql', 
            json: './db/staging/degrees.json' },
        { sql: './sql/academic_appt.sql', 
            json: './db/staging/appointments.json' },
        { sql: './sql/nonacademic_empl.sql', 
            json: './db/staging/nonacademic_jobs.json' },
        { sql: './sql/certification.sql', 
            json: './db/staging/certifications.json' },
        { sql: './sql/urls.sql', 
            json: './db/staging/websites.json' },
    ],
};



const sql     = require('mssql');
const process = require('process');
const fs      = require('fs');

// do async thinks in series, and do not stop if one
// fails. Just store up the results. Kind of like a 
// map() that waits for callbacks
var doSyncThings = function(things, action, final_cb) {
    var outputs = [];
    var doNext = function() {
        var current_thing = things.pop();
        if (current_thing) {
            action(current_thing,(err,res) => {
                outputs.push([current_thing,err,res]);
                doNext();
            });
        } else {
            return final_cb(outputs);
        }
    };
    doNext();
};

if (require.main === module) {
    const dbcreds = require('./dbcreds.json');
    config.db.user     = dbcreds.prod.user;
    config.db.password = dbcreds.prod.pw;

    sql.connect(config.db, (err) => {
        if (err) {
            console.error(err);
            process.exit(-1);
        }

        doSyncThings(config.queries, (item, icb) => {
            var qstr = [
                'SET TRANSACTION ISOLATION LEVEL SNAPSHOT',
                fs.readFileSync(item.sql, 'utf-8'),
            ].join('\n');

            console.log('querying: ');
            console.log(JSON.stringify(item,null,2));
            new sql.Request().query(qstr, (qerr, result) => {
                if (qerr) {
                    console.error('Problem with query');
                    console.error(qerr);
                    return icb('query fail');
                }
                if (result) {
                    fs.writeFileSync(item.json, JSON.stringify(result.recordsets[0],null,2));
                    console.log('query done');
                }
                return icb();
            });
        },
        (resultlist) => {
            console.log(resultlist);
            var ecount = resultlist.reduce((acc,cur) => { return cur[1] ? acc + 1 : acc;},0);
            if (ecount) {
                console.error('One or more queries failed.',ecount);
            } else {
                console.log('queries done');
            }
            process.exit(0);
        });
    });
}
