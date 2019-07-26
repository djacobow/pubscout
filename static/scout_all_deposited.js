/* jshint esversion:6 */

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
        label: 'Export Lab Publications',
    },
};

var pd = null;
var exp = null;

var init = function() {
    var pp = new entityPicker(ppconfig);
    exp = new Exporter(exporterconfig);
    var pdconfig = {
        urls: {
            claimed: '/scout/api/v1/query/claimed/deposited',
        },
        getCurrentID: () => { return 'all'; },
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
                exp.init(pubs, div, '');
            }
            waitBox('hide');
        },
    };
    pd = new pubsDisplayer(pdconfig);
    pp.init(() => {
        gebi('group_search_div').style.display = 'none';
        gebi('filt_dep').value = 'deposited';
        gebi('filt_link').value = 'not_linked';
        gebi('filt_ostiyr').value = 'any_OSTI';
        pd.makeFilter(); // why isn't this part of reload()?
        pd.reload();
    });
};


