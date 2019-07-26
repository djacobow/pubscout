
/* jshint esversion:6 */

var config = {
    peoplepicker: {
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
        },
        id_getter: (entity) => {
            var id = entity.LBNL_EMAILID;
            if (id) id = id.toLowerCase();
            else id = '_null_';
            return id;
        },
        sympl_lookup: false,
        query_box: {
            target: 'person_search_div',
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
                    cname: 'people_search_label',
                    text: 'Find a Researcher: ',
                    id: 'peoplesearchlabel',
                },
                input: {
                    id: 'peoplesearch',
                },
            },
            userdata: {
                show: false,
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
    },

    areapicker: {
        vars_of_interest: {
            list: [
                'code',
                'name',
            ],
        },
        load_filter: (id, ent) => {
            return true;
        },
        id_getter: (entity) => { return entity.code; },
        sympl_lookup: false,
        query_box: {
            intitial_search_terms: 'starting_search',
            target: 'area_search_div',
            select: {
                label: {
                    type: 'span',
                    text: 'Or select an area: ',
                    id: 'areaselectlabel',
                    cname: 'areaselectlabel',
                },
                dropdown: {
                    index: 'code',
                    value: 'name',
                    sortfn: (a,b) => {
                        return a.name.localeCompare(b.name);
                    },
                },
                id: 'areasearchselect',
            },
            search: {
                label: {
                    type: 'span',
                    cname: null,
                    text: '',
                    id: 'areasearchlabel',
                },
                input: {
                    cname: 'areasearch',
                    id: 'areasearchinput',
                },
            },
            userdata: {
                show: false,
                button: {
                    text: 'show area data',
                },
                type: 'div',
                cname: 'area_data',
                id: 'area_data',
            }
        },
        list_url: '/scout/api/v1/query/areas/list',
        create_query_box: true,
    },

    divisionpicker: {
        vars_of_interest: {
            hr: [
                'code',
                'name',
                'area',
            ],
        },
        load_filter: (id, ent) => {
            if (ent.name.match(/office/i)) return false;
            if (ent.name.match(/Directorate/)) return false;
            return true;
        },
        id_getter: (entity) => { return entity.code; },
        sympl_lookup: false,
        query_box: {
            intitial_search_terms: 'starting_search',
            target: 'division_search_div',
            select: {
                label: {
                    type: 'span',
                    text: 'Or select a division: ',
                    id: 'divisionselectlabel',
                    cname: 'divisionselectlabel',
                },
                dropdown: {
                    index: 'code',
                    value: 'name',
                    sortfn: (a,b) => {
                        return a.name.localeCompare(b.name);
                    },
                },
                id: 'divsearchselect',
            },
            search: {
                label: {
                    type: 'span',
                    cname: null,
                    text: '',
                    id: 'divisionsearchlabel',
                },
                input: {
                    cname: 'divsearch',
                    id: 'divsearchinput',
                },
            },
            userdata: {
                show: false,
                button: {
                    text: 'show division data',
                },
                type: 'div',
                cname: 'division_data',
                id: 'division_data',
            }
        },
        list_url: '/scout/api/v1/query/divisions/list',
        create_query_box: true,
    }
};

var initiateFakeAreaDivisionSearches = function() {
    var searchinput = gebi(config.divisionpicker.query_box.search.input.id);
    searchinput.value = '.';
    searchinput.dispatchEvent(new Event('keyup'));
    searchinput = gebi(config.areapicker.query_box.search.input.id);
    searchinput.value = '.';
    searchinput.dispatchEvent(new Event('keyup'));
};


var init = function() {
    var peoplepicker   = new entityPicker(config.peoplepicker);
    var divisionpicker = new entityPicker(config.divisionpicker);
    var areapicker     = new entityPicker(config.areapicker);

    peoplepicker.setLoadFn((x,y,z) => {
        var userid = peoplepicker.getCurrentID();
        // var username = peoplepicker.getEntityByID(userid).FULL_NM;
        window.location.href = '/scout/app/user/' + userid;
    });
    divisionpicker.setLoadFn((x,y,z) => {
        var divid = divisionpicker.getCurrentID();
        // var divname = divisionpicker.getEntityByID(divid).name;
        window.location.href = '/scout/app/division/' + divid;
    });
    areapicker.setLoadFn((x,y,z) => {
        var areaid = areapicker.getCurrentID();
        window.location.href = '/scout/app/area/' + areaid;
    });

    peoplepicker.init(() => {
        divisionpicker.init(() => { 
            areapicker.init(() => {
                initiateFakeAreaDivisionSearches();
            });
        });
    });

    gebi('banner').addEventListener('click',(ev) => {
        window.location.href = '/scout/app/profiles/';
    });
};


