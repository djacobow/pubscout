/* jshint esversion:6 */

var default_data_to_display = [
    [
        [ 'span', 'title', 'title', (elem,val) => {
            var v = val.replace(/<(\/)?inf>/gi,'<$1sub>');
            elem.innerHTML = v;
        }],
    ],
    [
        [ 'span', 'journal', 'journal', null ],
    ],
    [
        [ 'span', 'all_authors', 'authors', null ],
    ],
    [
        [ 'span', 'pub_type', 'pub_type', (elem,val) => { 
            elem.innerText = '(' + val + ')'; } 
        ],
        [ 'span', 'volume', 'volume', (elem,val) => { 
            elem.innerText = 'Vol. ' + val; } 
        ],
        [ 'span', 'issue', 'issue', (elem,val) => { 
            elem.innerText = 'Issue ' + val; } 
        ],
        [ 'span', 'publication_date', 'pub_date', (elem, val) => { 
            elem.innerText = 'published ' + SymplDateToFriendly(val); }
        ],
        [ 'span', 'ostiyr', 'ostiyr', (elem, val) => { 
            elem.innerText = 'OSTI FY' + val; }
        ],
    ],
    [
        [ 'span', 'system_id', 'symplectic_link', (elem,val) => { 
            var a = cr('a'); 
            a.innerText = 'Elements #' + val; 
            a.href = 'https://oapolicy.universityofcalifornia.edu/viewobject.html?cid=1&id=' + val;
            a.target = '_blank';
            elem.appendChild(a);
        } ],
        [ 'span', 'doi', 'doi', (elem, val) => {
            var a = cr('a'); 
            a.innerText = 'DOI ' + val; 
            a.href = 'https://doi.org/' + val;
            a.target = '_blank';
            elem.appendChild(a);
        } ],
        [ 'span', 'escholarship_link', 'eschol', (elem, val) => {
            var a = cr('a'); 
            a.innerText = 'eScholarship'; 
            a.href = val;
            a.target = '_blank';
            elem.appendChild(a);
        } ],
        [ 'span', 'lbnl_id', 'lbnl_id', (elem, val) => { 
            elem.innerText = 'LBNL ID ' + val; 
        } ],
    ],
    [
        [ 'span', 'deposit_date', 'deposit_date', (elem, val) => { 
            elem.innerText = 'Desposited on ' + val; 
        } ],
        [ 'span', 'funding_linked_date', 'funding_linked_date', (elem, val) => { 
            elem.innerText = 'Funding linked on ' + val; 
        } ],
        [ 'span', 'funding_source', 'funding_source', (elem, val) => { 
            elem.innerText = 'Funding source ' + val; 
        } ],
    ],
    [
        [ 'span', 'claimed_by_userids', 'claimed_by', (elem, vals, item, caller_this) => { 
            names = [];
            vals.forEach((val) => {
                var name = caller_this.getUserByID(val);
                if (name) {
                    var a = cr('a');
                    a.href = '/scout/app/scoutUser/' + name.EMPLOYEE_ID;
                    a.innerText = name.FULL_NM;
                    names.push(a);
                } else {
                    names.push(cr('span',null,val));
                }
            });
            if (names.length) {
                elem.innerText = 'Claimed by: ';
                appendChildren(elem, names, ', ');
            }
        } ],
        [ 'span', 'awaiting_claim_by_userids', 'claimed_by', (elem, vals, item, caller_this) => { 
            names = [];
            vals.forEach((val) => {
                var name = caller_this.getUserByID(val);
                if (name) {
                    var a = cr('a');
                    a.href = '/scout/app/scoutUser/' + name.EMPLOYEE_ID;
                    a.innerText = name.FULL_NM;
                    names.push(a);
                } else {
                    names.push(cr('span',null,val));
                }
            });
            if (names.length) {
                elem.innerText = 'Awaiting claimed by: ';
                appendChildren(elem, names, ', ');
            }
        } ],
    ],
    [
        [ 'span', 'favorited', 'favorited_by', (elem, vals, item, caller_this) => { 
            names = [];
            Object.keys(vals).forEach((val) => {
                var name = caller_this.getUserByID(val);
                if (name) {
                    var a = cr('a');
                    a.href = '/scout/app/scoutUser/' + name.EMPLOYEE_ID;
                    a.innerText = name.FULL_NM;
                    names.push(a);
                } else {
                    names.push(cr('span',null,val));
                }
            });
            if (names.length) {
                elem.innerText = 'Favorited by: ';
                appendChildren(elem, names, ', ');
            }
        } ],
        [ 'span', 'hidden', 'hidden_by', (elem, vals, item, caller_this) => { 
            names = [];
            Object.keys(vals).forEach((val) => {
                var name = caller_this.getUserByID(val);
                if (name) {
                    var a = cr('a');
                    a.href = '/scout/app/scoutUser/' + name.EMPLOYEE_ID;
                    a.innerText = name.FULL_NM;
                    names.push(a);
                } else {
                    names.push(cr('span',null,val));
                }
            });
            if (names.length) {
                elem.innerText = 'Hidden by: ';
                appendChildren(elem, names, ', ');
            }
        } ],
    ],
];




var pubsDisplayer = function(config) {


    this.preReload = config.preReload;
    this.postReload = config.postReload;
    this.getCurrentUserID = config.getCurrentID;
    this.getUserByID  = config.getUserByID;
    this.urls = config.urls;
    this.data_to_display = config.data_to_display || default_data_to_display;
    this.show_oa_tracking = true;
    if (config.hasOwnProperty('show_oa_tracking')) {
        this.show_oa_tracking = config.show_ow_tracking;
    }
    this.show_table_header = true;
    if (config.hasOwnProperty('show_table_header')) {
        this.show_table_header = config.show_table_header;
    }
    this.number_rows = true;
    if (config.hasOwnProperty('number_rows')) {
        this.number_rows = config.number_rows;
    }

    this.pubs = [];
    this.filt = null;
    this.corpuses = {
        claimed: true,
        unclaimed: false,
    };

    ['list_sort'].forEach((fname) => {
        var el = gebi(fname);
        if (el) {
            el.addEventListener('change', () => {
                this.populateList();
            });
        }
    });
    ['filt_oa', 
     'filt_dep', 
     'filt_link', 
     'filt_claimed', 
     'filt_ostiyr',
     'filt_excluded',
     'filt_claimed_age',
     'filt_deposit_age',
     'filt_flink_age',
    ].forEach((fname) => {
        var el = gebi(fname);
        if (el) {
            el.addEventListener('change', () => {
                this.makeFilter();
                this.reload();
            });
        }
    });
};

pubsDisplayer.prototype.makeFilter = function() {
    var filt_oa      = gebi('filt_oa').value;
    var filt_dep     = gebi('filt_dep').value;
    var filt_link    = gebi('filt_link').value;
    var filt_claimed = gebi('filt_claimed').value;
    var filt_ostiyr  = gebi('filt_ostiyr').value;
    var filt_excl    = gebi('filt_excluded').value;
    var filt_claimed_age = gebi('filt_claimed_age').value;
    var filt_deposit_age = gebi('filt_deposit_age').value;
    var filt_flink_age   = gebi('filt_flink_age').value;

    var filt = {};
    switch (filt_oa) {
        case 'in' : filt.oa_status = ['nonnull']; break;
        case 'out': filt.oa_status = ['nullzero']; break;
        default: break;
    }

    switch (filt_excl) {
        case 'excluded':     filt.not_externally_funded = ['eq',true]; break;
        case 'not_excluded': filt.not_externally_funded = ['nullzero']; break;
        default: break;
    }

    switch (filt_dep) {
        case 'deposited':     filt.deposited = ['nonnull_gte',1]; break;
        case 'not_deposited': filt.deposited = ['nullzero']; break;
        default: break;
    }

    switch (filt_link) {
        case 'linked':     filt.funding_linked = ['nonnull_gte',1]; break;
        case 'not_linked': filt.funding_linked = ['nullzero']; break;
        default: break;
    }

    switch (filt_ostiyr) {
        case '2016':     filt.ostiyr = ['eq','2016']; break;
        case '2017':     filt.ostiyr = ['eq','2017']; break;
        case '2018':     filt.ostiyr = ['eq','2018']; break;
        case '2019':     filt.ostiyr = ['eq','2019']; break;
        case 'any_OSTI': filt.ostiyr = ['nonnull'];   break;
        case 'not_OSTI': filt.ostiyr = ['nullzero'];  break;
        default: break;
    }

    var addDays = function(d,y=0) {
        var dt = new Date();
        dt.setDate(dt.getDate()+d);
        dt.setFullYear(dt.getFullYear()+y);
        return dt;
    };

    switch (filt_claimed_age) {
        case '1d':   filt.claim_date = [ 'nonnull_gte_date', addDays(-1).toISOString() ]; break;
        case '7d':   filt.claim_date = [ 'nonnull_gte_date', addDays(-7).toISOString() ]; break;
        case '30d':  filt.claim_date = [ 'nonnull_gte_date', addDays(-30).toISOString() ]; break;
        case '90d':  filt.claim_date = [ 'nonnull_gte_date', addDays(-90).toISOString() ]; break;
        case '1y':   filt.claim_date = [ 'nonnull_gte_date', addDays(0,-1).toISOString() ]; break;
        case '2y':   filt.claim_date = [ 'nonnull_gte_date', addDays(0,-2).toISOString() ]; break;
        default: break;
    }

    switch (filt_deposit_age) {
        case '1d':   filt.deposit_date = [ 'nonnull_gte_date', addDays(-1).toISOString() ]; break;
        case '7d':   filt.deposit_date = [ 'nonnull_gte_date', addDays(-7).toISOString() ]; break;
        case '30d':  filt.deposit_date = [ 'nonnull_gte_date', addDays(-30).toISOString() ]; break;
        case '90d':  filt.deposit_date = [ 'nonnull_gte_date', addDays(-90).toISOString() ]; break;
        case '1y':   filt.deposit_date = [ 'nonnull_gte_date', addDays(0,-1).toISOString() ]; break;
        case '2y':   filt.deposit_date = [ 'nonnull_gte_date', addDays(0,-2).toISOString() ]; break;
        default: break;
    }

    switch (filt_flink_age) {
        case '1d':   filt.funding_linked_date = [ 'nonnull_gte_date', addDays(-1).toISOString() ]; break;
        case '7d':   filt.funding_linked_date = [ 'nonnull_gte_date', addDays(-7).toISOString() ]; break;
        case '30d':  filt.funding_linked_date = [ 'nonnull_gte_date', addDays(-30).toISOString() ]; break;
        case '90d':  filt.funding_linked_date = [ 'nonnull_gte_date', addDays(-90).toISOString() ]; break;
        case '1y':   filt.funding_linked_date = [ 'nonnull_gte_date', addDays(0,-1).toISOString() ]; break;
        case '2y':   filt.funding_linked_date = [ 'nonnull_gte_date', addDays(0,-2).toISOString() ]; break;
        default: break;
    }


    this.filt = (Object.keys(filt).length) ? filt : null;

    switch (filt_claimed) {
        case 'claimed':  
            this.corpuses.claimed = true; 
            this.corpuses.unclaimed = false;
            break;
        case 'not_claimed':  
            this.corpuses.claimed = false; 
            this.corpuses.unclaimed = true;
            break;
        default:
            this.corpuses.claimed = true; 
            this.corpuses.unclaimed = true;
            break;
    }
};

pubsDisplayer.prototype.reload = function() {
    var empid = this.getCurrentUserID();
    if (empid) {

        pvars = [ ['q', empid], ];
        if (this.filt) pvars.push(['extras', JSON.stringify(this.filt)]);

        var params = pvars.map((param) => {
            return param[0] + '=' + encodeURIComponent(param[1]); 
        }).join('&');

        var urls = {
            claimed: this.urls.claimed + '?' + params,
            unclaimed: this.urls.unclaimed + '?' + params,
        };

        this.pubs = [];
        if (this.corpuses.claimed) {
            if (this.preReload) this.preReload(null);
            GetJS(urls.claimed, (aerr,ares) => {
                if (aerr || ares.err) {
                    console.log(aerr, ares);
                } else {
                    this.pubs = ares.result;
                }
                if (this.corpuses.unclaimed) {
                    GetJS(urls.unclaimed, (berr,bres) => {
                        if (berr || bres.err) {
                            console.log(berr,bres);
                        } else {
                            this.pubs = this.pubs.concat(bres.result);
                        }
                        this.populateList();
                    });
                } else {
                    this.populateList();
                }
            });
        } else if (this.corpuses.unclaimed) {
            if (this.preReload) this.preReload(null);
            GetJS(urls.unclaimed, (err,res) => {
                if (err || res.err) {
                    console.log(err,res);
                } else {
                    this.pubs = res.result;
                }
                this.populateList();
            });
        }
    } 
};

pubsDisplayer.prototype.populateOne = function(item, target, number) {
    var row     = cr('tr');
    var num_td  = cr('td');
    var main_td = cr('td');
    var oa_td   = cr('td');
    var dep_td  = cr('td');
    var fund_td = cr('td');

    if (this.show_oa_tracking) {
        var in_oa   = item.oa_status !== null;
        var is_dep  = item.deposited && (item.deposited > 0);
        var is_fund = item.funding_linked && (item.funding_linked > 0);
        var is_excluded = item.not_externally_funded;
        var is_excepted = item.oa_policy_exception;

        if (in_oa && !is_excluded && !is_excepted) {
            oa_td.innerText  = '\u2714';
            dep_td.innerText = is_dep ? '\u2714' : '\u2718';
            dep_td.classList.add(is_dep ? 'compliance_ok' : 'compliance_not_ok');
            fund_td.innerText = is_fund ? '\u2714' : '\u2718';
            fund_td.classList.add(is_fund ? 'compliance_ok' : 'compliance_not_ok');
            if (is_dep && is_fund) {
                row.classList.add('compliance_ok');
                oa_td.classList.add('compliance_ok');
            } else {
                row.classList.add('compliance_not_ok');
                oa_td.classList.add('compliance_not_ok');
            }
        } else if (is_excluded) {
            oa_td.innerHTML = 'marked non-Lab';
            row.classList.add('compliance_user_na');
            oa_td.classList.add('compliance_user_na');
        } else if (is_excepted) {
            oa_td.innerText = is_excepted;
            row.classList.add('compliance_user_na');
            oa_td.classList.add('compliance_user_na');
        } else {
            oa_td.innerHTML = '<sup>n</sup>/<sub>a</sub>';
            row.classList.add('compliance_na');
        }
    }

    num_td.innerText = number;
    if (this.number_rows) {
        row.appendChild(num_td);
    }
    row.appendChild(main_td);

    if (this.show_oa_tracking) {
        row.appendChild(oa_td);
        row.appendChild(dep_td);
        row.appendChild(fund_td);
    }

    bagToDOM(main_td, this.data_to_display, item, this);
    target.appendChild(row);
};


pubsDisplayer.prototype.pubSort = function() {
    var sort_select_elem = gebi('list_sort');
    var sort_t = 'pub_date_r';
    if (sort_select_elem) {
        sort_t = sort_select_elem.value;
    }

    var f = null;
    switch (sort_t) {
        case 'pub_date_f':
            f = function(a,b) { 
                return a.publication_date<b.publication_date ? -1 : 
                       a.publication_date>b.publication_date ? 1 : 0;
            };
            break;
        case 'pub_date_r':
            f = function(a,b) { 
                return a.publication_date<b.publication_date ? 1 : 
                       a.publication_date>b.publication_date ? -1 : 0;
            };
            break;
        case 'title_alpha':
            f = function(a,b) { 
                return a.title<b.title? -1 : 
                       a.title>b.title? 1 : 0;
            };
            break;
        case 'journal_alpha':
            f = function(a,b) { 
                return a.journal<b.journal? -1 : 
                       a.journal>b.journal? 1 : 0;
            };
            break;
        default:
    }

    this.pubs.sort(f);
};

pubsDisplayer.prototype.populateList = function() {
    var table = cr('table');
    table.classList.add('pubs_table');
    removeChildren(table);

    if (this.show_table_header) {
        var top_tr   = cr('tr');
        table.appendChild(top_tr);

        var num_th   = cr('th',null,'#');
        var main_th  = cr('th',null,'Publication Information');

        var in_oa_th, dep_th, fund_th;

        if (this.show_oa_tracking) {
            in_oa_th = cr('th',null, 'OA');
            dep_th   = cr('th', null, 'Dep');
            fund_th  = cr('th', null, 'Fund');
            num_th.width = '3%';
            main_th.width = '88%';
            in_oa_th.width = '3%';
            dep_th.width = '3%';
            fund_th.width = '3%';
        } else {
            main_th.width = '100%';
        }

        if (this.number_rows) {
            top_tr.appendChild(num_th);
        }
        top_tr.appendChild(main_th);

        if (this.show_oa_tracking) {
            top_tr.appendChild(in_oa_th);
            top_tr.appendChild(dep_th);
            top_tr.appendChild(fund_th);
        }
    }

    if (this.pubs.length) {
        this.pubSort();
        arrayForEach(this.pubs, this.populateOne.bind(this), table);
        if (this.postReload) this.postReload(null,table,this.pubs);
    } else {
        var t = cr('td',null,'no results');
        t.colSpan = 5;
        table.appendChild(cr('tr').appendChild(t));
        if (this.postReload) this.postReload('no_results', t, []);
    }
};


