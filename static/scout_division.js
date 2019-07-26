/* jshint esversion:6 */

var epconfig = {
    vars_of_interest: {
        hr: [
            'code',
            'name',
            'area',
        ],
    },
    id_getter: (entity) => { return entity.code; },
    sympl_lookup: false,
    query_box: {
        intitial_search_terms: 'starting_search',
        target: 'group_search_div',
        select: {
            dropdown: {
                index: 'code',
                value: 'name',
            },
            id: 'divsearchselect',
        },
        search: {
            label: {
                type: 'span',
                cname: null,
                text: 'Division Search',
            },
            input: {
                id: 'divsearch',
            },
        },
        userdata: {
            button: {
                text: 'show ' + global_entity_type + ' data',
            },
            type: 'div',
            cname: 'division_data',
            id: global_entity_type + '_data',
        }
    },
    list_url: '/scout/api/v1/query/' + global_entity_type + 's/list',
    create_query_box: true,
};

var ppconfig = {
    vars_of_interest: {
        hr: [ ],
    },
    sympl_lookup: false,
    list_url: '/scout/api/v1/query/hr/indexable',
    create_query_box: false,
};


var exporterconfig = {
    button: {
        classname: 'export_button',
        id: 'export_button',
        label: 'Export Division Publications',
    },
};

var pd = null;
var exp = null;

var init = function() {
    var ep = new entityPicker(epconfig);
    var pp = new entityPicker(ppconfig);
    exp = new Exporter(exporterconfig);
    var bything = ((global_entity_type == 'area') ? 'byareaid' : 'bydivid');
    var pdconfig = {
        urls: {
            claimed: '/scout/api/v1/query/claimed/' + bything,
            unclaimed: '/scout/api/v1/query/unclaimed/' + bything,
        },
        getCurrentID: ep.getCurrentID.bind(ep),
        getUserByID: pp.getEntityByID.bind(pp),
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
    pd = new pubsDisplayer(pdconfig);
    ep.setLoadFn(pd.reload.bind(pd));
    pp.init(() => {
        ep.init(() => { });
    });
};


