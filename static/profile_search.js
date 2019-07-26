/* jshint esversion:6 */

var last_kws = [];

var config = {
        urls: [], // not used
        getCurrentID: () => { return null; },
        preReload: (err) => { waitBox('show'); },
        postReload: (err, tables) => {
            var ec = gebi('everything_container');
            removeChildren(ec);
            if (err) {
                ec.appendChild(cr('span',null,err));
            } else {
                ec.appendChild(tables.publications.table);
                try {
                    window.__dimensions_embed.addBadges();
                    _altmetric.embed_init();
                } catch (badge_exception) {
                    console.log(badge_exception);
                }
            }
        },
        tables: [{
                source_name: 'publications',
                table_class: 'pubs_table',
                sortfn: (a, b) => {
                    return a.search_score < b.search_score ? 1 :
                        a.search_score > b.search_score ? -1 : 0;
                },
                display_params: {
                    left: [
                        [
                            ['span', 'title', 'title', (elem, val) => {
                                var v = val.replace(/<(\/)?inf>/gi, '<$1sub>');
                                appendChildren(elem,highlightKeywords(v,last_kws));
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
                                if (vals && vals.length) {
                                elem.innerText = '[wait]';
                                coac.lookupUsers(vals, (outputs) => {

                                    var elemlist = [];
                                    outputs.forEach((output) => {
                                            if (!output[1] && output[2]) {
                                                var n = output[2].FULL_NM;
                                                var a = cr('a');
                                                a.href = '/scout/app/user/' + output[0];
                                                a.innerText = n;
                                                elemlist.push(a);
                                            } else {
                                                elemlist.push(cr('span', null, output[0]));
                                            }
                                    });
                                    if (elemlist.length) {
                                        removeChildren(elem);
                                        elem.appendChild(cr('span', 'coauthors', 'LBNL Authors: '));
                                        appendChildren(elem, elemlist, ', ');
                                    } else {
                                        removeChildren(elem);
                                    }
                                });
                                } else {
                                    elem.innerText = '';
                                }
                            }],
                        ],
                        [
                            ['div','abstract','abstract_div', (elem, abstr) => {
                                if (abstr) {
                                    var s1 = cr('span','abstract_controller','Abstract:');
                                    var s2 = cr('div','abstract_controlled');
                                    appendChildren(s2,highlightKeywords(abstr, last_kws));
                                    elem.appendChild(s1); 
                                    elem.appendChild(s2); 
                                    hidify(s1,s2,['Show Abstract \u25ba','Hide Abstract \u25bc']);
                                }
                            }],
                        ],
                    ],
                    right: [
                        [
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
        ],
};

var highlightKeywords = function(intext, keywords = []) {
    var re = new RegExp('\\b(' + keywords.join('|') + ')\\b', 'i');
    var chunks = intext.split(re);
    var outlist = chunks.map((chunk) => {
        var sp = cr('span',null,chunk);
        if (chunk.match(re)) {
            sp.className = 'highlight_keyword_match';
        }
        return sp;
    });
    return outlist;
};

var createSearchBox = function (target, search_term) {
    var d = cr('div','kw_search_div');
    var s = cr('span','kw_search_label','Search for Publications by Title or Abstract:');
    var i = cr('input','kw_search_input');
    i.type = 'text';
    if (search_term && (search_term != '___null_search___')) {
        i.value = search_term;
        setTimeout(() => {
            i.dispatchEvent(new Event('keyup'));
        },250);
    }
    var timer = null;
    i.addEventListener('keyup', (ev) => {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            doNewSearch(i.value,displaySearchResult);
        },750);
    });
    d.appendChild(s);
    d.appendChild(i);
    target.appendChild(d);
};

var displaySearchResult = function(err,result) {
    waitBox('hide');
    if (!err && result && result.matches) {
        last_kws = result.keywords;
        var pubids = Object.keys(result.matches);
        if (pubids.length) {
            pubs_array = pubids.map((id) => { 
                var pub = result.matches[id].pub[0];
                pub.search_score = result.matches[id].score;
                return pub;
            });
            var ml = new MultiLister(config);
            ml.setData('publications',pubs_array);
        } else {
            gebi('everything_container').innerText = 'Nothing found.';
        }
    } else {
        gebi('everything_container').innerText = 'Nothing found or search error.';
    }
};

var doNewSearch = function(term, cb) {
    var url_base = '/scout/api/v1/kwsearch';
    var term_encoded = '?q=' + encodeURIComponent(term);
    waitBox('show');
    GetJS(url_base + term_encoded, (err,res) => {
        if (err) {
            return cb('error_accessing_kw_search_index');
        } else if (res.err) {
            return cb(res.err);
        } else {
            return cb(null, res.result);
        }
    });
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

var init = function() {
    var search_term = gebi('starting_search').value;
    var info_div = gebi('info_div');
    createSearchBox(info_div, search_term);

};

