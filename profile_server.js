/* jshint esversion:6 */

var path           = require('path');
var express        = require('express');
var bodyparser     = require('body-parser');
var cookieParser   = require('cookie-parser');
var API            = require('./lib/api.js');
var nonAPI         = require('./lib/nonapi.js');
var Profiles       = require('./lib/profiles.js');


var config = {
    statics: {
        real_files: {
            'lab_logo.png': 1,
            'headshot_placeholder.jpg': 1,

            'base.css': 1,
            'scout.css': 1,
            'scout_division.css': 1,
            'profile.css': 1,
            'creative.css': 1,

            'shared.js': 1,
            'bagtodom.js': 1,
            'entitypicker.js': 1,

            'scoutpublist.js': 1,
            'scout_user.js': 1,
            'scout_division.js': 1,
            'scout_all_deposited.js': 1,

            'multilistifier.js': 1,
            'tabbedcontent.js': 1,
            'profile_top.js': 1,
            'profile_person.js': 1,
            'profile_search.js': 1,
            'profile_group.js': 1,
            'creative.js': 1,
            'exporter.js': 1,
        },
    },
    profiles: {
        forms: {
            test0 : {
                title: 'Test Form Number 0',
                elements: [
                    { 
                        id: 'i0',
                        type: 'text',
                        deflt: 'i0 default',
                        validator: ['v', 'return null;' ],
                        label: 'i0',
                    },
                    {
                        id: 's0',
                        type: 'select',
                        label: 's0',
                        options: [
                            { idx: 'a', name: 'AAA', },
                            { idx: 'b', name: 'BBB', },
                            { idx: 'c', name: 'CCC', deflt: 1},
                        ],
                    },
                    {
                        id: 't0',
                        type: 'textarea',
                        rows: 5,
                        cols: 40,
                        label: 't0',
                        deflt: 'This goes in the text area',
                        validator: ['v', 'var ok = (v.match(/poo/)); return ok ? null : "not poo";'],
                    },
                    {
                        id: 'c0',
                        type: 'checkbox',
                        label: 'c0',
                        deflt: true,
                    },
                    {
                        id: 'dt0',
                        type: 'date',
                        label: 'dt0',
                        deflt: '1973-07-02',
                    },
                    {
                        id: 'tm0',
                        type: 'time',
                        label: 'tm0',
                        deflt: '19:50',
                    },
                    {
                        id: 'dtm0',
                        type: 'datetime-local',
                        label: 'dtm0',
                        deflt: '19:50',
                    },
                    {
                        id: 'url0',
                        type: 'url',
                        label: 'url0',
                        deflt: 'https://slate.com',
                    },
                ],
            }
        }
    }
};





var main      = function(port) {
    var api      = new API();
    var nonapi   = new nonAPI(config.statics);
    var profiles = new Profiles(config.profiles);

    nonapi.init(function(nonapierr,nonapires) {
        if (nonapierr) {
            console.error('app could not initialize.');
        }
        var nonapirouter = express.Router();
        nonapi.setupRoutes(nonapirouter);

        api.init(function(apierr,apires) {
            if (apierr) {
                console.error('API could not initialize.');
            }
            var apirouter = express.Router();
            api.setupRoutes(apirouter);

            profiles.init(function(ferr,fres) {
                var profrouter = express.Router();
                profiles.setupRoutes(profrouter);
                var app = express();
                app.use(bodyparser.urlencoded({extended: true, limit: '1mb', parameterLimit: 8192}));
                app.use(bodyparser.json({limit:'1mb'}));
                app.use(cookieParser());
                app.use('/scout/api',  apirouter);
                app.use('/scout/app',  nonapirouter);
                // Will get to this at a later date... 
                // app.use('/scout/profiles', profrouter);
                console.log('Listening on port ' + port);
                app.listen(port);
            });
        });
    });
};

if (require.main === module) {
    main(10001);
}

