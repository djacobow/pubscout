/* jshint esversion:6 */

var epconfig = {
    vars_of_interest: {
        hr: [
            'LAST_NM',
            'FIRST_NM',
            'MIDDLE_NM',
            'ORG_AREA_NM',
            'ORG_LEVEL1_NM',
            'JOB_CODE_DS',
            'JOB_CODE',
            'EMPLOYEE_STATUS_DS',
            'INDEXABLE',
            'CURRENT',
            'EPPN',
            'FACULTY_APPOINTEE',
        ],
        sympl: [
            'last_name',
            'first_name',
            'Elements ID',
            'LBNL EPPN',
            'UCNetId',
            'academic',
            'current',
            'login_allowed',
            'position',
            'ORCID',
            'arXiv ID',
            'Clarivate ResearcherID',
            'Scopus ID',
            'pubs_claimed',
            'pubs_deposited',
            'pubs_funding_linked',
            'pubs_pending',
            'pubs_declined',
            'Incomplete Deposits',
            'primary_department',
            'logins',
            'last_login',
        ],
    },
    id_getter: (entity) => {
        var id = entity.LBNL_EMAILID;
        if (id) id = id.toLowerCase();
        else id = '_null_';
        return id;
    },
    sympl_lookup: true,
    query_box: {
        target: 'group_search_div',
        intitial_search_terms: 'starting_search',
        select: {
            dropdown: {
                index: 'EMPLOYEE_ID',
                value: 'FULL_NM',
            },
            id: 'peoplesearchselect',
        },
        search: {
            label: {
                type: 'span',
                cname: null,
                text: 'Person Search',
            },
            input: {
                id: 'peoplesearch',
            },
        },
        userdata: {
            button: {
                text: 'show user data',
            },
            type: 'div',
            cname: 'user_data',
            id: 'user_data',
        }
    },
    list_url: '/scout/api/v1/query/hr/indexable',
    create_query_box: true,
};

var exporterconfig = {
    button: {
        classname: 'export_button',
        id: 'export_button',
        label: 'Export User Publications',
    },
};

var pd = null;
var exp = null;

var init = function() {
    var ep = new entityPicker(epconfig);
    exp = new Exporter(exporterconfig);
    var pd_config = {
        urls: {
            claimed: '/scout/api/v1/query/claimed/byempid',
            unclaimed: '/scout/api/v1/query/unclaimed/byempid',
        },
        getCurrentID: ep.getCurrentID.bind(ep),
        getUserByID: ep.getEntityByID.bind(ep),
        preReload: (err) => {
            waitBox('show');
            removeChildren(gebi('pubs_div'));
        },
        postReload: (err, table, pubs) => {
            if (!err) {
                var div = gebi('pubs_div');
                removeChildren(div);
                div.appendChild(table);
                exp.init(pubs, div, ep.getCurrentID());
            }
            waitBox('hide');
        },
    };
    pd = new pubsDisplayer(pd_config);
    ep.setLoadFn(pd.reload.bind(pd));
    ep.init(() => { });
};


