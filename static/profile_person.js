/* jshint esversion:6 */

var lookupPhonebookData = function(person, cb) {
    var url_base = '/scout/api/v1/proxy/phonebook/';
    var email = person.LBNL_EMAIL_ID || person.EPPN;
    var q_encoded = 'mail:' + encodeURIComponent(email);
    GetJS(url_base + q_encoded, (err, res) => {
        if (err) {
            return cb('error_accessing_phonebook');
        } else if (res.err) {
            return cb(res.err);
        } else {
            return cb(null, res.result);
        }
    });
};


var showPhonebook = function(person, phres, target) {
    if (phres.nickname) {
        gebi('users_preferred_full_name').innerText = phres.nickname + ' ' + person.LAST_NM;
    }

    if (phres.pphone) {
        var ph = cr('div', 'phone_number', 'Phone ');
        var a = cr('a', 'phone_number', phres.pphone.toString());
        a.href = 'tel:' + phres.pphone;
        ph.appendChild(a);
        target.appendChild(ph);
    }
    if (phres.ms) {
        var addr = cr('div', 'mailing_address');
        var l1 = cr('div', 'addr_line_1', 'Lawrence Berkeley National Lab');
        var l2 = cr('div', 'addr_line_2', '1 Cyclotron Road Mail Stop ' + phres.ms);
        var l3 = cr('div', 'addr_line_2', 'Berkely CA 94720');
        addr.appendChild(l1);
        addr.appendChild(l2);
        addr.appendChild(l3);
        target.appendChild(addr);
    }
};


var lookupUser = function(search_term, cb) {
    var find_url = '/scout/api/v1/query/hr/byempid?q=' + search_term;
    GetJS(find_url, (ferr, fres) => {
        if (fres && fres.result && Array.isArray(fres.result) && fres.result.length) {
            return cb(null, fres.result[0]);
        } else {
            var list_url = '/scout/api/v1/query/hr/indexable';
            GetJS(list_url, (err, res) => {
                if (err) return cb(err);
                matches = [];
                var re = new RegExp(search_term, 'i');
                res.result.forEach((person) => {
                    if (person.FULL_NM.match(re)) {
                        matches.push(person);
                    }
                });
                if (matches.length) {
                    cb(null, matches[0]);
                }
            });
        }
    });
};


var coac = new CoauthorCache(lookupUser);
var current_user = null;
var current_symperson = null;

var config = {
    multidisplayer: {
        urls: [
            '/scout/api/v1/query/extras/byempid', ['/scout/api/v1/query/claimed/byempid', 'publications'],
        ],
        getCurrentID: () => {
            return current_user.EMPLOYEE_ID;
        },
        preReload: (err) => {
            waitBox('show');
        },
        postReload: (err, tables) => {
            var tcontent_config = [];
            var ec = gebi('everything_container');
            removeChildren(ec);
            Object.keys(tables).forEach((table_name) => {
                if (tables[table_name]) {
                    tcontent_config.push({
                        name: table_name,
                        content: tables[table_name].table,
                        label: tables[table_name].label || table_name,
                    });
                }
            });
            if (current_symperson && current_symperson.overview) {
                tcontent_config.push({
                    name: 'overview',
                    label: 'research statement',
                    content: cr('div', 'research_statement', current_symperson.overview),
                });
            }
            ec.appendChild(tabbedcontent.create(tcontent_config));

            try {
                // fire the magic "badge" creators. This code is in minified
                // js from Altmetric and Dimensions, typically served from
                // a CDM
                window.setTimeout(() => {
                    window.__dimensions_embed.addBadges();
                    _altmetric.embed_init();
                }, 3000);
            } catch (badge_exception) {
                // oh well
                console.log(badge_exception);
            }
            waitBox('hide');
        },
        tables: [{
                source_name: 'publications',
                table_class: 'pubs_table',
                sortfn: (a, b) => {
                    return a.publication_date < b.publication_date ? 1 :
                        a.publication_date > b.publication_date ? -1 : 0;
                },
                /*
                                // This alternative sort function prioritizes highlighted
                                // papers. But if we are putting them in a separate section
                                // that's probably not needed.
                                sortfn: (a,b) => {
                                    var id = current_user.EMPLOYEE_ID;
                                    var a_favorite = id && a.favorited.hasOwnProperty(id);
                                    var b_favorite = id && b.favorited.hasOwnProperty(id);
                                    if ((a_favorite && b_favorite) || (!a_favorite && !b_favorite)) {
                                        return a.publication_date < b.publication_date ? 1 :
                                               a.publication_date > b.publication_date ? -1 : 0;
                                    } else if (a_favorite) {
                                        return -1;
                                    } else {
                                        return 1;
                                    }
                                },
                */
                filtfn: (a) => {
                    var id = current_user.EMPLOYEE_ID;
                    return !(id && a.hidden.hasOwnProperty(id));
                },
                display_params: {
                    left: [
                        [
                            ['span', 'title', 'title', (elem, val) => {
                                var v = val.replace(/<(\/)?inf>/gi, '<$1sub>');
                                elem.innerHTML = v;
                            }],
                        ],
                        [
                            ['span', 'journal', 'journal', null],
                        ],
                        [
                            ['span', 'all_authors', 'authors', null],
                        ],
                        [
                            ['span', 'pub_type', 'pub_type', null],
                            ['span', 'volume', 'volume', (elem, val) => {
                                elem.innerText = 'Vol. ' + val;
                            }],
                            ['span', 'issue', 'issue', (elem, val) => {
                                elem.innerText = 'Issue ' + val;
                            }],
                            ['span', 'publication_date', 'pub_date', (elem, val) => {
                                elem.innerText = 'published ' + SymplDateToFriendly(val);
                            }],
                        ],
                        [
                            ['span', 'doi', 'doi', (elem, val) => {
                                var a = cr('a');
                                a.innerText = 'DOI ' + val;
                                a.href = 'https://doi.org/' + val;
                                a.target = '_blank';
                                elem.appendChild(a);
                            }],
                            ['span', 'escholarship_link', 'eschol', (elem, val) => {
                                var a = cr('a');
                                a.innerText = 'Full text at eScholarship.org';
                                a.href = val;
                                a.target = '_blank';
                                elem.appendChild(a);
                            }],
                            ['span', 'lbnl_id', 'lbnl_id', (elem, val) => {
                                elem.innerText = 'LBNL ID ' + val;
                            }],
                        ],
                        [
                            ['span', null, 'coauthors', (elem, item, caller_this) => {
                                var vals = item.claimed_by_userids;
                                elem.innerText = '[wait]';
                                coac.lookupUsers(vals, (outputs) => {

                                    var elemlist = [];
                                    outputs.forEach((output) => {
                                        if (output[0] != current_user.EMPLOYEE_ID) {
                                            if (!output[1] && output[2]) {
                                                var n = output[2].FULL_NM;
                                                var a = cr('a');
                                                a.href = '/scout/app/user/' + output[0];
                                                a.innerText = n;
                                                elemlist.push(a);
                                            } else {
                                                elemlist.push(cr('span', null, output[0]));
                                            }
                                        }
                                    });
                                    if (elemlist.length) {
                                        removeChildren(elem);
                                        elem.appendChild(cr('span', 'coauthors', 'LBNL Coauthors: '));
                                        appendChildren(elem, elemlist, ', ');
                                    } else {
                                        removeChildren(elem);
                                    }
                                });
                            }],
                        ],
                        [
                            ['div','abstract','abstract_div', (elem, abstr) => {
                                if (abstr) {
                                    var s1 = cr('span','abstract_controller','Abstract:');
                                    var s2 = cr('div','abstract_controlled',abstr);
                                    elem.appendChild(s1); 
                                    elem.appendChild(s2); 
                                    hidify(s1,s2,['Show Abstract \u25ba','Hide Abstract \u25bc']);
                                }
                            }],
                        ],
                    ],
                    right: [
                        [
                            /*
                            // These shows the citation counts as included in 
                            // Elements itself. The "live" badges are better, so
                            // we're leaving this out for now.
                            [ 'span', null, 'citation_counts', (elem, item, caller_this) => {
                                var possibles = {
                                    'wos': 'Web of Science',
                                    'wos_lite': 'Web of Science',
                                    'scopus' : 'Scopus',
                                    'europe_pubmed_central': 'Europe PubMed Central',
                                    'dimensions': 'Dimensions',
                                };
                                var have_count = Object.keys(possibles).filter((k) => {
                                    return item.hasOwnProperty(k + '_citation_count') &&
                                        item[k + '_citation_count'];
                                });
                                if (have_count.length) {
                                    elem.innerText = 'Citations: ' + 
                                        have_count.map((k) => { 
                                            return '(' + possibles[k] + ') ' + item[k + '_citation_count']; 
                                        }).join(', ');
                                }
                            }],
                            */
                            ['div', 'doi', 'icon_holder', (elem, doi) => {
                                var dm = cr('div', '__dimensions_badge_embed__');
                                dm.setAttribute('data-doi', doi);
                                dm.setAttribute('data-style', 'small_circle');
                                dm.setAttribute('data-hide-zero-citations', 'true');
                                dm.style.display = 'inline';
                                elem.appendChild(dm);

                                var am = cr('div', 'altmetric-embed');
                                am.setAttribute('data-badge-popover', 'right');
                                am.setAttribute('data-badge-type', 'donut');
                                am.setAttribute('data-doi', doi);
                                am.setAttribute('data-hide-no-mentions', 'true');
                                am.setAttribute('data-badge-popover', 'left');
                                am.style.display = 'inline';
                                elem.appendChild(am);
                            }],
                        ],
                    ]
                }
            },
            {
                source_name: 'professional',
                label: 'professional activities',
                table_class: 'professional_table',
                sortfn: (a, b) => {
                    return a['start-date'] < b['start-date'] ? 1 :
                        a['start-date'] > b['start-date'] ? -1 : 0;
                },
                display_params: [
                    [
                        ['span', null, 'profa_title', (elem, item) => {
                            var candidates = ['description', 'title', 'Computed Title'];
                            var t = null;
                            var i = 0;
                            while ((!t || !t.length) && i < candidates.length) {
                                t = item[candidates[i]];
                                i += 1;
                            }
                            if (t && t.length) elem.innerText = t;
                            else elem.innerText = JSON.stringify(item, null, 2);
                        }],
                        ['span', 'institution', 'profa_institution', null],
                    ],
                    [
                        ['span', null, 'profa_date', (elem, item) => {
                            var candidates = [
                                'start-date',
                                'event-start-date',
                                'Reporting Date 1',
                                'Reporting Date 2'
                            ];
                            var t = null;
                            var i = 0;
                            while (!t && i < candidates.length) {
                                t = item[candidates[i]];
                                if (t && Array.isArray(t)) t = t[0];
                                i += 1;
                            }
                            if (t) elem.innerText = SymplDateToFriendly(t);
                            else elem.innerText = JSON.stringify(item, null, 2);
                        }],
                        ['span', 'event-type', 'profa_event_type', null],
                        ['span', 'Type', 'profa_type', (elem, val) => {
                            if (Array.isArray(val) && val.length) {
                                elem.innerText = val[0];
                            }
                        }],
                    ],
                ],
            },
            {
                source_name: 'appointments',
                table_class: 'appointments_table',
                sortfn: (a, b) => {
                    return a.start_date < b.start_date ? 1 :
                        a.start_date > b.start_date ? -1 : 0;
                },
                display_params: [
                    [
                        ['span', 'organization', 'appt_org'],
                    ],
                    [
                        ['span', 'position', 'appt_position'],
                        ['span', 'suborganization', 'appt_suborg'],
                    ],
                    [
                        ['span', null, 'appt_dates', (elem, item) => {
                            var sd = item.start_date;
                            var ed = item.end_date;
                            if (sd && ed) {
                                elem.innerText = SymplDateToFriendly(sd) + ' - ' +
                                    SymplDateToFriendly(ed);
                            } else if (sd) {
                                elem.innerText = 'from ' + SymplDateToFriendly(sd);
                            } else if (ed) {
                                elem.innerText = 'to ' + SymplDateToFriendly(ed);
                            }
                        }],
                    ],
                ],
            },
            {
                source_name: 'jobs',
                label: 'non-academic employment',
                table_class: 'jobs_table',
                sortfn: (a, b) => {
                    return a.start_date < b.start_date ? 1 :
                        a.start_date > b.start_date ? -1 : 0;
                },
                display_params: [
                    [
                        ['span', 'organization', 'nonacademic_job_org'],
                        ['span', 'suborganization', 'nonacademic_job_suborg'],
                    ],
                    [
                        ['span', 'position', 'nonacademic_job_position'],
                        ['span', 'start_date', 'nonacademic_job_start', (elem, val) => {
                            elem.innerText = 'From ' + SymplDateToFriendly(val);
                        }],
                        ['span', 'end_date', 'nonacademic_job_end', (elem, val) => {
                            elem.innerText = 'To ' + SymplDateToFriendly(val);
                        }],
                    ],
                ],
            },
            {
                source_name: 'degrees',
                label: 'education',
                table_class: 'degrees_table',
                sortfn: (a, b) => {
                    return a.end_date < b.end_date ? 1 :
                        a.end_date > b.end_date ? -1 : 0;
                },
                display_params: [
                    [
                        ['span', 'organization', 'school_org'],
                        ['span', 'suborganization', 'school_suborg'],
                    ],
                    [
                        ['span', 'degree', 'school_degree'],
                        ['span', 'Field of Study', 'school_field'],
                        ['span', 'end_date', 'school_graduation_date', (elem, val) => {
                            elem.innerText = 'Conferred ' + SymplDateToFriendly(val);
                        }],
                    ],
                    [
                        ['span', 'thesis', 'school_thesis'],
                    ],
                ],
            },
            {
                source_name: 'certifications',
                table_class: 'certifications_table',
                sortfn: (a, b) => {
                    return a.effective_date < b.effective_date ? 1 :
                        a.effective_Date > b.effective_date ? -1 : 0;
                },
                display_params: [
                    [
                        ['span', 'organization', 'cert_org'],
                        ['span', 'suborganization', 'cert_suborg'],
                    ],
                    [
                        ['span', 'title', 'cert_title'],
                    ],
                    [
                        ['span', 'effective_date', 'cert_effective_date', (elem, val) => {
                            elem.innerText = 'Effective ' + SymplDateToFriendly(val);
                        }],
                        ['span', 'expiry_date', 'cert_expiry_date', (elem, val) => {
                            elem.innerText = 'Expired ' + SymplDateToFriendly(val);
                        }],
                    ],
                ],
            },
            {
                source_name: 'websites',
                table_class: 'websites_table',
                sortfn: (a, b) => {
                    var al = a.label || a.url;
                    var bl = b.label || b.url;
                    return al < bl ? 1 :
                        al > bl ? -1 : 0;
                },
                display_params: [
                    [
                        ['span', null, 'website_url', (elem, item) => {
                            var a = cr('a', 'website_url');
                            a.innerText = item.label || item.url;
                            a.href = item.url;
                            elem.appendChild(a);
                        }],
                    ],
                ],
            },
        ],
    },
    tabbedcontent: {
        id_base: 'tabbedcontent',
        tabs: [],
    },
};


var showHRData = function(target, person) {

    var hrtable = cr('table', 'hr_data_table');
    target.appendChild(hrtable);
    var row0 = cr('tr');
    hrtable.appendChild(row0);
    var pictd = cr('td');
    var img = cr('img');
    img.id = 'headshot';
    pictd.width = '210px';
    pictd.appendChild(img);
    pictd.rowSpan = 3;
    var nametd = cr('td');
    var contacttd = cr('td');
    var namespan = cr('span', 'hr_user_full_name');
    namespan.id = 'users_preferred_full_name';
    nametd.appendChild(namespan);
    var complete_name = formName(person);
    namespan.innerText = complete_name;
    nametd.appendChild(cr('br'));
    var email = person.LBNL_EMAIL_ID || person.EPPN;
    if (email) {
        var mailto = cr('a', 'hr_user_email', email);
        mailto.href = 'mailto:' + email;
        nametd.appendChild(mailto);
    }

    var gstemail = person.GUEST_EMAILID;
    if (gstemail) {
        var gstmailto = cr('a', 'hr_user_email', gstemail);
        gstmailto.href = 'mailto:' + gstemail;
        nametd.appendChild(cr('br'));
        nametd.appendChild(gstmailto);
    }
    row0.appendChild(pictd);
    row0.appendChild(nametd);
    row0.appendChild(contacttd);

    var row1 = cr('tr');
    hrtable.appendChild(row1);
    var groupstd = cr('td');
    groupstd.colSpan = 2;
    row1.appendChild(groupstd);

    var division_span = cr('span', 'hr_division');
    var divlink = cr('a', null, person.ORG_LEVEL1_NM);
    divlink.href = '/scout/app/division/' +
        person.ORG_LEVEL0_CD +
        person.ORG_LEVEL1_CD;
    division_span.appendChild(divlink);
    groupstd.appendChild(division_span);
    groupstd.appendChild(cr('br'));
    var area_span = cr('span', 'hr_area');
    var arealink = cr('a', null, person.ORG_AREA_NM);
    arealink.href = '/scout/app/area/' + person.ORG_LEVEL0_CD;
    area_span.appendChild(arealink);
    groupstd.appendChild(area_span);

    var row2 = cr('tr');
    hrtable.appendChild(row2);
    var symtarget = cr('td');
    symtarget.colSpan = 2;
    row2.appendChild(symtarget);
    lookupSymplData(person, (syerr, syres) => {
        if (!syerr) {
            var symperson = syres.result[0];
            current_symperson = symperson;
            showSymplData(symtarget, symperson);
        }
    });
    lookupPhonebookData(person, (pherr, phres) => {
        if (!pherr) {
            showPhonebook(person, phres, contacttd);
        }
    });


    // Maybe this will help with SEO:
    document.
    querySelector('meta[name="description"]')
        .setAttribute("content", complete_name + ' Berkeley Lab Profile');
    document.
    querySelector('meta[name="keywords"]')
        .setAttribute("content", ['profile', 'LBNL', 'Berkeley Lab', complete_name,
            complete_name + ' profile',
            complete_name + ' publications',
        ].join(','));
    document.
    querySelector('meta[name="robots"]')
        .setAttribute("content", 'index,follow');
    document.title = complete_name + '\'s Berkeley Lab Profile';
};

var showSymplData = function(target, symuser) {
    var interesting_things = [
        [
            'Clarivate ResearcherID', (v) => {
                var a = cr('a', null, 'Clarivate ' + v);
                a.href = 'http://www.researcherid.com/rid/' + v;
                return a;
            },
        ],
        [
            'ORCID', (v) => {
                var a = cr('a', null, 'ORCID ' + v);
                a.href = 'https://orcid.org/' + v;
                return a;
            },
        ],
        [
            'arXiv ID', (v) => {
                var a = cr('a', null, 'arXiv.org');
                a.href = v;
                return a;
            },
        ],
        [
            'Scopus ID', (v) => {
                var ids = v.split(', ');
                var as = ids.filter((id) => {
                    return (id !== null) && id.length;
                }).map((id) => {
                    var a = cr('a', null, 'Scopus ' + id);
                    a.href = 'https://www.scopus.com/authid/detail.uri?authorId=' + id;
                    return a;
                });
                var s = cr('span');
                as.forEach((a) => {
                    s.appendChild(a);
                    s.appendChild(cr('span', null, ', '));
                });
                if (s.lastChild) s.removeChild(s.lastChild);

                return s;
            },
        ],
    ];

    interesting_things.forEach((thing) => {
        if (symuser[thing[0]]) {
            var new_elems = thing[1](symuser[thing[0]]);
            target.appendChild(new_elems);
            target.appendChild(cr('span', null, ', '));
        }
    });

    var headshot = gebi('headshot');
    if (symuser && symuser.photo_data && symuser.photo_type) {
        var data = 'data:' + symuser.photo_type + ';base64,' + symuser.photo_data;
        headshot.src = data;
    } else {
        headshot.src = '/scout/app/static/headshot_placeholder.jpg';
        headshot.style.width = '200px';
        headshot.style.height = '200px';
        // headshot.src = 'https://placekitten.com/200/200';
    }
    if (target.lastChild) target.removeChild(target.lastChild);
};


var lookupSymplData = function(person, cb) {
    var eppn = (person.LBNL_EMAIL_ID || person.EPPN);
    if (eppn) {
        eppn = eppn.toLowerCase();
        GetJS('/scout/api/v1/query/users/byeppn?q=' + eppn, (err, res) => {
            return cb(err, res);
        });
    } else {
        return cb('no_eppn');
    }
};


// This is just to avvoid having a long copy of the same info in the config
// above; this makes another section with slight adjustments for highlights
var splitPubsTable = function(tconfigs) {
    var pubs_config = null;
    var new_pubs_config = {};
    tconfigs.forEach((tconfig) => {
        if (tconfig.source_name == 'publications') {
            Object.keys(tconfig).forEach((tn) => {
                new_pubs_config[tn] = tconfig[tn];
            });
            new_pubs_config.filtfn = (a) => {
                var id = current_user.EMPLOYEE_ID;
                return (id &&
                    !a.hidden.hasOwnProperty(id) &&
                    a.favorited.hasOwnProperty(id));
            };
            tconfig.filtfn = (a) => {
                var id = current_user.EMPLOYEE_ID;
                return (id &&
                    !a.hidden.hasOwnProperty(id));
            };
        }
    });
    if (Object.keys(new_pubs_config).length) {
        new_pubs_config.label = 'highlighted work';
        new_pubs_config.table_class = 'highlighted_pubs_table';
        new_pubs_config.table_name = 'highlighted_pubs';
        tconfigs.unshift(new_pubs_config);
    }
};


var init = function() {
    var search_term = gebi('starting_search').value;
    if (search_term == '___null_search___') {
        gebi('body').appendChild(cr('p', null, 'No user search provided'));
    } else {
        lookupUser(search_term, function(err, res) {
            if (err) return;
            current_user = res;
            showHRData(gebi('info_div'), current_user);
            tabbedcontent = new TabbedContent({
                id_base: 'thetabs',
            });
            splitPubsTable(config.multidisplayer.tables);
            multidisplayer = new MultiLister(config.multidisplayer);
            multidisplayer.reload();
        });
    }

    gebi('banner').addEventListener('click', (ev) => {
        window.location.href = '/scout/app/profiles/';
    });
};
