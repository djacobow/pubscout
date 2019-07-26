/* jshint esversion:6 */

var Data = require('./data.js');
var helpers = require('./helpers.js');
var process = require('process');

var fixEmails = function(raw) {
    Object.keys(raw).forEach((id) => {
        raw[id].LBNL_EMAILID = raw[id].LBNL_EMAILID.toLowerCase();
        raw[id].GUEST_EMAILID = raw[id].GUEST_EMAILID.toLowerCase();
    });
};

var markOSTIs = function(pubs, ostis) {
    Object.keys(pubs).forEach((sysid) => {
        var doi = pubs[sysid].doi || null;
        if (doi && ostis[doi]) {
            pubs[sysid].ostiyr = ostis[doi].osti_yr;
        }
    });
};

var addEmplIDs = function(pubs, people_by_lblmail, people_by_gstmail) {
    Object.keys(pubs).forEach((pubid) => {
        ['claimed_by','awaiting_claim_by'].forEach((namesfield) => {
            var name_str = pubs[pubid][namesfield] || '';
            name_str = name_str.trim();
            var eppns = name_str.split(/,/).map((x) => { return x.trim().toLowerCase(); });
            var fixed_names = [];
            eppns.forEach((eppn) => {
                if (eppn.length > 2) {
                    var lbl_id = null;
                    var m0 = eppn.match(/120(\d{6})@lbl.gov/);
                    var m1 = eppn.match(/([\.\w-]+@\w+\.(gov|edu))/);
                    if (m0) {
                        lbl_id = m0[1];
                    }
                    if (m1) {
                        var email = m1[1];
                        if (people_by_lblmail[email]) {
                            lbl_id = people_by_lblmail[email].EMPLOYEE_ID;
                        } else if (people_by_gstmail[email]) {
                            lbl_id = people_by_gstmail[email].EMPLOYEE_ID;
                        }
                    }
                    if (lbl_id) {
                        fixed_names.push(lbl_id);
                    } else {
                        console.warn('cannot get empid for pubid ' + pubid + ' eppn ' + eppn);
                    }
                }
            });
            pubs[pubid][namesfield + '_userids'] = fixed_names;
        });
    });
};

var combineByID = function(unclaimed, claimed) {
    out = {};
    Object.keys(claimed).forEach((pubid) => {
        out[pubid] = claimed[pubid];
    });
    Object.keys(unclaimed).forEach((pubid) => {
        // the claimed record is more complete, so
        // use that if the pub appears in both lists
        if (!out[pubid]) out[pubid] = unclaimed[pubid];
    });
    return out;
};


var arrangeByUser = function(pubs, userlist) {
    var pbu = {};

    Object.keys(pubs).forEach((pubid) => {
        if (pubs[pubid][userlist]) {
            pubs[pubid][userlist].forEach((userid) => {
                if (userid && userid.length) {
                    if (!pbu[userid]) pbu[userid] = { };
                    pbu[userid][pubid] = pubs[pubid];
                }
            });
        }
    });
    return pbu;
};


var arrangeByDivisionOrArea = function(pubs, people, claimed, userlist, by_area = false) {
    var pbd = {};

    Object.keys(pubs).forEach((pubid) => {
        if (pubs[pubid][userlist]) {
            pubs[pubid][userlist].forEach((userid) => {
                if (userid && userid.length) {
                    var user = people[userid];
                    if (user && (user.INDEXABLE == 'Y') && (user.CURRENT == 'Y')) {
                        var area_cd = people[userid].ORG_LEVEL0_CD;
                        if (by_area) {
                            if (!pbd[area_cd])  pbd[area_cd]  = { };
                            if (!claimed || !claimed[area_cd] || !claimed[area_cd][pubid]) {
                                pbd[area_cd][pubid] = pubs[pubid];
                            }
                        } else {
                            var div_cd  = area_cd + people[userid].ORG_LEVEL1_CD;
                            if (!pbd[div_cd])  pbd[div_cd]  = { };
                            if (!claimed || !claimed[div_cd] || !claimed[div_cd][pubid]) {
                                pbd[div_cd][pubid] = pubs[pubid];
                            }
                        }
                    }
                }
            });
        }
    });
    return pbd;
};


var filterIndexableAndCurrent = function(raw) {
    var out = {};
    Object.keys(raw).forEach((empid) => {
        var elem = raw[empid];
        if ((elem.INDEXABLE == 'Y') && (elem.CURRENT == 'Y')) out[empid] = elem;
    });
    return out;
};

var arrangeGroupsByEmpID = function(tables, hr, users, idname) {

    var hr_by_eppn = {};
    Object.keys(hr).forEach((empid) => {
        var person = hr[empid];
        var eppn = person.EPPN || person.LBNL_EMAILID;
        if (eppn) {
            hr_by_eppn[eppn.toLowerCase()] = person;
        }
    });

    var users_by_symid = helpers.flipKey(users, 'Elements ID');

    var tdata_by_empid = {};
    Object.keys(tables).forEach((table_name) => {
        Object.keys(tables[table_name]).forEach((recid) => {
            var record = tables[table_name][recid];
            var symid  = record['User ID'];
            if (Array.isArray(symid) && symid.length) {
                symid = symid[0];
            }
            // hack to deal with dueling Keasling v Keasling and 
            // Yelick v Yelick accounts
            if (symid == 23604) symid = 12278;
            if (symid == 23692) symid = 13522;

            var user = users_by_symid[symid];
            if (user) {
                var eppn = user['LBNL EPPN'] || user.email;
                if (eppn) {
                    eppn = eppn.toLowerCase();
                    var person = hr_by_eppn[eppn];
                    if (person) {
                        var empid = person.EMPLOYEE_ID;
                        if (!tdata_by_empid[empid]) {
                            tdata_by_empid[empid] = {};
                        }
                        if (!tdata_by_empid[empid][table_name]) {
                            tdata_by_empid[empid][table_name] = [ record ];
                        } else {
                            tdata_by_empid[empid][table_name].push(record);
                        }
                    } else {
                        console.warn('no_person_for_eppn',eppn);
                    }
                } else {
                    console.warn('no_eppn_for_symid',symid);
                }
            } else {
                console.warn('no_user_for_symid',symid,' (probably not current/indexable user');
            }
        });
    });
    return tdata_by_empid;
};

var arrangeFromSymplIDToEmpID = function(profas, hr, users) {

    var hr_by_eppn = {};
    Object.keys(hr).forEach((empid) => {
        var person = hr[empid];
        var eppn = person.EPPN || person.LBNL_EMAILID;
        if (eppn) {
            hr_by_eppn[eppn.toLowerCase()] = person;
        }
    });

    var users_by_symid = helpers.flipKey(users, 'Elements ID');

    var profas_by_empid = {};
    Object.keys(profas).forEach((profid) => {
        var profa = profas[profid];
        var symid = profa['User ID'];
        if (Array.isArray(symid) && symid.length) {
            symid = symid[0];
        }

        // hack to deal with dueling Keasling v Keasling and 
        // Yelick v Yelick accounts
        if (symid == 23604) symid = 12278;
        if (symid == 23692) symid = 13522;

        var user = users_by_symid[symid];
        if (user) {
            var eppn = user['LBNL EPPN'] || user.email;
            if (eppn) {
                eppn = eppn.toLowerCase();
                var person = hr_by_eppn[eppn];
                if (person) {
                    empid = person.EMPLOYEE_ID;
                    if (!profas_by_empid[empid]) {
                        profas_by_empid[empid] = [ profa ];
                    } else {
                        profas_by_empid[empid].push(profa);
                    }
                } else {
                    console.warn('no_person_for_eppn',eppn);
                }
            } else {
                console.warn('no_eppn_for_symid',symid);
            }
        } else {
            console.warn('no_user_for_symid',symid,profa);
        }
    });
    return profas_by_empid;
};


/* Each publication record has (potentially) and array of EPPNs that 
 * represent people who have marked a pub as "favorite" or "hidden"
 * according to their preferences. This function converts those arrays
 * into dicts, so that client can more easily determine how to sort/
 * display a pub.
 */
var elaboratePreferenceTags = function(raw) {
    raw.forEach((elem) => {
        ['hidden','favorited'].forEach((preftype) => {
            var new_pref = {};
            if (elem[preftype] && elem[preftype].length) {
                var ids = elem[preftype].split(',');
                ids.forEach((id) => {
                    if (id && id.length) {
                        var m = id.match(/([\.\w-]+)@\w+\.(gov|edu)/);
                        if (m) new_pref[m[1].toLowerCase()] = 1;
                    }
                });
            }
            elem[preftype] = new_pref;
        });
    });
};

var config = {
    load: {
        hr: {
            file: '../db/hrdata.json',
            transformRaw: [
                fixEmails,
            ],
            variations: [
                {
                    name: 'byempid',    
                    fn: (raw) => { return raw; },
                    acl: 'key',
                },
                {
                    name: 'bylblemail', 
                    fn: (raw) => {
                        return helpers.flipKey(raw, 'LBNL_EMAILID');
                    },
                    temporary: true,
                    acl: 'key',
                },
                {
                    name: 'bygstemail', 
                    acl: 'key',
                    temporary: true,
                    fn: (raw) => {
                        return helpers.flipKey(raw, 'GUEST_EMAILID');
                    },
                },
                {
                    name: 'indexable',  
                    fn: filterIndexableAndCurrent,
                    acl: 'any',
                },
            ],
        },
        claimed: { file: '../db/pubs.json',
            variations: [
                {
                    acl: 'key',
                    name: 'bypubid',       
                    fn: (raw) => {
                        elaboratePreferenceTags(raw);
                        return helpers.arrayToDictBy(raw, 'system_id');
                    },
                },
            ],
        },
        unclaimed: { file: '../db/unclaimed.json',
            variations: [
                {
                    acl: 'key',
                    name: 'bypubid',       
                    fn: (raw) => {
                        elaboratePreferenceTags(raw);
                        return helpers.arrayToDictBy(raw, 'system_id');
                    },
                },
            ],
        },
        users: { file: '../db/users.json',
            variations: [
                {
                    acl: 'any',
                    name: 'byeppn',       
                    fn: (raw) => {
                        return helpers.arrayToDictBy(
                            raw, ['LBNL EPPN','email','Username'], true
                        );
                    },
                },
            ],
        },
        osti:  { file: '../db/osti.json', },
        professional : { file: '../db/profas.json',
            variations: [
                {
                    acl: 'key',
                    name: 'byactid',       
                    fn: (raw) => {
                        return helpers.arrayToDictBy(raw, 'User Record ID');
                    },
                },
            ],
        },
        appointments: { file: '../db/appointments.json',
            variations: [
                {
                    acl: 'key',
                    name: 'byactid',       
                    fn: (raw) => {
                        return helpers.arrayToDictBy(raw, 'User Record ID');
                    },
                },
            ],
        },
        jobs: { file: '../db/nonacademic_jobs.json',
            variations: [
                {
                    acl: 'key',
                    name: 'byactid',       
                    fn: (raw) => {
                        return helpers.arrayToDictBy(raw, 'User Record ID');
                    },
                },
            ],
        },
        degrees: { file: '../db/degrees.json',
            variations: [
                {
                    acl: 'key',
                    name: 'byactid',       
                    fn: (raw) => {
                        return helpers.arrayToDictBy(raw, 'User Record ID');
                    },
                },
            ],
        },
        certifications: { file: '../db/certifications.json',
            variations: [
                {
                    acl: 'key',
                    name: 'byactid',       
                    fn: (raw) => {
                        return helpers.arrayToDictBy(raw, 'User Record ID');
                    },
                },
            ],
        },
        websites: { file: '../db/websites.json',
            variations: [
                {
                    acl: 'key',
                    name: 'byactid',       
                    fn: (raw) => {
                        return helpers.arrayToDictBy(raw, 'User Record ID');
                    },
                },
            ],
        },
        divisions: { file: '../db/division_info.json',
            variations: [
                {
                    acl: 'key',
                    name: 'bydivid',       
                    fn: (raw) => { return raw; },
                },
                {
                    acl: 'any',
                    name: 'list',
                    fn: (raw) => {
                        var o = {};
                        Object.keys(raw).forEach((dcode) => {
                            o[dcode] = {
                                name: raw[dcode].name,
                                area: raw[dcode].area,
                                code: dcode,
                            };
                        });
                        return o;
                    },
                },
            ],
        },
        areas: { file: '../db/area_info.json',
            variations: [
                {
                    acl: 'key',
                    name: 'byareaid',       
                    fn: (raw) => { return raw; },
                },
                {
                    acl: 'any',
                    name: 'list',
                    fn: (raw) => {
                        var o = {};
                        Object.keys(raw).forEach((acode) => {
                            o[acode] = {
                                name: raw[acode].name,
                                code: acode,
                            };
                        });
                        return o;
                    },
                },
            ],
        },
    },
    combine: [
        {
            inputs: [
                { name: 'hr', variation: 'indexable' },
            ],
            fn: (people) => {
                var areas = {};
                Object.values(people).forEach((person) => {
                    var l0_code = person.ORG_LEVEL0_CD;
                    areas[l0_code] = {
                        code: l0_code,
                        name: person.ORG_AREA_NM
                    };
                });
                return areas;
            },
            output: { acl: 'any', name: 'hr', variation: 'areas' },
            disable: true,
        },
        {
            inputs: [
                { name: 'hr', variation: 'indexable' },
            ],
            fn: (people) => {
                var divisions = {};
                Object.values(people).forEach((person) => {
                    var l0_code = person.ORG_LEVEL0_CD;
                    var l1_code = person.ORG_LEVEL1_CD;
                    var cd = l0_code + l1_code;
                    divisions[cd] = {
                        code: cd,
                        name: person.ORG_LEVEL1_NM,
                        area: person.ORG_AREA_NM
                    };
                });
                return divisions;
            },
            output: { acl: 'any', name: 'hr', variation: 'divisions' },
            disable: true,
        },
        {
            inputs: [
                { name: 'hr', variation: 'indexable' },
            ],
            fn: (people) => {
                var hr_by_divid = {};
                Object.values(people).forEach((person) => {
                    var l0_code = person.ORG_LEVEL0_CD;
                    var l1_code = person.ORG_LEVEL1_CD;
                    var cd = l0_code + l1_code;
                    if (!hr_by_divid[cd]) hr_by_divid[cd] = [];
                    hr_by_divid[cd].push(person);
                });
                return hr_by_divid;
            },
            output: { acl: 'key', name: 'hr', variation: 'bydivid' },
        },
        {
            inputs: [
                // Note the order here matters. "claimed" pubs have more info,
                // so when a pub is claimed by x and unclaimed by y, we want
                // the recrod from the claimed query
                { name: 'unclaimed', variation: 'bypubid' },
                { name: 'claimed', variation: 'bypubid' },
            ],
            fn: combineByID,
            output: { acl: 'key', name: 'all_pubs', variation: 'bypubid' },
        },
        {
            inputs: [
                { name: 'all_pubs', variation: 'bypubid' },
                { name: 'osti', variation: 'raw' },
            ],
            fn: markOSTIs,
        },
        {
            inputs: [
                { name: 'claimed', variation: 'bypubid'},
            ],
            fn: (pubs) => {
                var out = [];
                var do_not_restrict = false;
                Object.values(pubs).forEach((pub) => {
                    if (do_not_restrict) {
                        out.push(pub);
                    } else {
                        if (pub.deposited) {
                            out.push(pub);
                        };
                    }
                });
                return {all:out};
            },
            output: { acl: 'key', name: 'claimed', variation: 'deposited' },
        },
        {
            inputs: [
                { name: 'all_pubs', variation: 'bypubid' },
                { name: 'hr', variation: 'bylblemail' },
                { name: 'hr', variation: 'bygstemail' },
            ],
            fn: addEmplIDs,
        },
        {
            inputs: [
                { name: 'all_pubs', variation: 'bypubid' },
            ],
            fn: (pubs) => {
                return arrangeByUser(pubs,'claimed_by_userids');
            },
            output: { acl: 'key', name: 'claimed', variation: 'byempid' },
        },
        {
            inputs: [
                { name: 'all_pubs', variation: 'bypubid' },
            ],
            fn: (pubs) => {
                return arrangeByUser(pubs,'awaiting_claim_by_userids');
            },
            output: { acl: 'key', name: 'unclaimed', variation: 'byempid' },
        },
        {
            inputs: [
                { name: 'all_pubs', variation: 'bypubid' },
                { name: 'hr', variation: 'byempid' },
            ],
            fn: (pubs,people) => { 
                return arrangeByDivisionOrArea(pubs, people, null, 'claimed_by_userids',false);
            },
            output: { acl: 'key', name: 'claimed', variation: 'bydivid' },
        },
        {
            inputs: [
                { name: 'all_pubs', variation: 'bypubid' },
                { name: 'hr', variation: 'byempid' },
            ],
            fn: (pubs,people) => { 
                return arrangeByDivisionOrArea(pubs, people, null, 
                    'claimed_by_userids',true);
            },
            output: { acl: 'key', name: 'claimed', variation: 'byareaid' },
        },
        {
            inputs: [
                { name: 'all_pubs', variation: 'bypubid' },
                { name: 'hr', variation: 'byempid' },
                { name: 'claimed', variation: 'bydivid' },
            ],
            fn: (pubs, people, claimed) => { 
                return arrangeByDivisionOrArea(pubs, people, claimed,
                    'awaiting_claim_by_userids',false);
            },
            output: { acl: 'key', name: 'unclaimed', variation: 'bydivid' },
        },
        {
            inputs: [
                { name: 'all_pubs', variation: 'bypubid' },
                { name: 'hr', variation: 'byempid' },
                { name: 'claimed', variation: 'byareaid' },
            ],
            fn: (pubs, people, claimed) => { 
                return arrangeByDivisionOrArea(
                    pubs, people, claimed,
                   'awaiting_claim_by_userids',true);
            },
            output: { acl: 'key', name: 'unclaimed', variation: 'byareaid' },
        },
        {
            inputs: [
                { name: 'professional', variation: 'byactid' },
                { name: 'hr', variation: 'byempid' },
                { name: 'users', variation: 'byeppn' },
            ],
            fn: (profas, hr, users) => { 
                return arrangeFromSymplIDToEmpID(profas, hr, users);
            },
            output: { acl: 'key', name: 'professional', variation: 'byempid' },
            disable: true,
        },
        {
            inputs: [
                { name: 'appointments', variation: 'byactid' },
                { name: 'hr', variation: 'byempid' },
                { name: 'users', variation: 'byeppn' },
            ],
            fn: (appts, hr, users) => { 
                return arrangeFromSymplIDToEmpID(appts, hr, users);
            },
            output: { acl: 'key', name: 'appointments', variation: 'byempid' },
            disable: true,
        },
        {
            inputs: [
                { name: 'jobs', variation: 'byactid' },
                { name: 'hr', variation: 'byempid' },
                { name: 'users', variation: 'byeppn' },
            ],
            fn: (jobs, hr, users) => { 
                return arrangeFromSymplIDToEmpID(jobs, hr, users);
            },
            output: { acl: 'key', name: 'jobs', variation: 'byempid' },
            disable: true,
        },
        {
            inputs: [
                { name: 'degrees', variation: 'byactid' },
                { name: 'hr', variation: 'byempid' },
                { name: 'users', variation: 'byeppn' },
            ],
            fn: (degrees, hr, users) => { 
                return arrangeFromSymplIDToEmpID(degrees, hr, users);
            },
            output: { acl: 'key', name: 'degrees', variation: 'byempid' },
            disable: true,
        },
        {
            inputs: [
                { name: 'certifications', variation: 'byactid' },
                { name: 'hr', variation: 'byempid' },
                { name: 'users', variation: 'byeppn' },
            ],
            fn: (certifications, hr, users) => { 
                return arrangeFromSymplIDToEmpID(certifications, hr, users);
            },
            output: { acl: 'key', name: 'certifications', variation: 'byempid' },
            disable: true,
        },
        {
            inputs: [
                { name: 'websites', variation: 'byactid' },
                { name: 'hr', variation: 'byempid' },
                { name: 'users', variation: 'byeppn' },
            ],
            fn: (websites, hr, users) => { 
                return arrangeFromSymplIDToEmpID(websites, hr, users);
            },
            output: { acl: 'key', name: 'websites', variation: 'byempid' },
            disable: true,
        },
        {
            inputs: [
                { name: 'professional',   variation: 'byactid' },
                { name: 'appointments',   variation: 'byactid' },
                { name: 'jobs',           variation: 'byactid' },
                { name: 'degrees',        variation: 'byactid' },
                { name: 'certifications', variation: 'byactid' },
                { name: 'websites',       variation: 'byactid' },
                { name: 'hr',             variation: 'byempid' },
                { name: 'users',          variation: 'byeppn' },
            ],
            fn: (pros, apps, jobs, degs, certs, webs, hr, users) => {
                return arrangeGroupsByEmpID(
                    {
                        professional: pros,
                        appointments: apps,
                        jobs: jobs,
                        degrees: degs,
                        certifications: certs,
                        websites: webs,
                    }, hr, users);
            },
            output: { acl: 'key', name: 'extras', variation: 'byempid' },
        },
    ],
};



var initDataModel = function(cb) {
    var d = new Data(config);
    d.init(function(err) {
        return cb(err,d);
    });
};

module.exports = initDataModel;

