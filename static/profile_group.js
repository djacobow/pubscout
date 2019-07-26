/* jshint esversion:6 */

var lookupGroupByID = function(id,cb) {
    var info_url = '/scout/api/v1/query/' +
        global_entity_type + 's/' +
        ((global_entity_type == 'division') ? 
            'bydivid' : 
            'byareaid'
        ) + '?q=' + id;
    GetJS(info_url, (err,res) => {
        if (err) return cb(err);
        if (res.result.length) {
            return cb(null,res.result[0]);
        } else {
            return cb('no_match');
        }
    });
};


var lookupSubGroup = function(group, target) {
    if (global_entity_type == 'division') {
        var id = group.code;
        var url = '/scout/api/v1/query/hr/bydivid?q=' + id;
        GetJS(url, (err,res) => {
            if (err) {
                console.error(err);
                return;
            }
            showSubGroup(target, res.result);
        });
    } else if (global_entity_type == 'area') {
        var divisions = group.divisions;
        showSubGroup(target, divisions);
    }
};

var showSubGroup = function(target, subgroup) {
    var table = cr('table','group_subgroup_list');
    var sgarray = null;
    if (global_entity_type == 'division') {
        sgarray = subgroup;
        sgarray.sort((a,b) => {
            return a.FULL_NM < b.FULL_NM ? -1 :
                   a.FULL_NM > b.FULL_NM ? 1 : 0;
        });
    } else if (global_entity_type == 'area') {
        sgarray = Object.keys(subgroup);
        sgarray.sort((a,b) => {
            return subgroup[a] < subgroup[b] ? -1 :
                   subgroup[a] > subgroup[b] ? 1 : 0;
        }); 
    }


    sgarray.forEach((sg) => {
        var tr = cr('tr','group_subgroup_row');
        var tdn = cr('td','group_subgroup_name_td');
        var a = cr('a','group_subgroup_link');
        if (global_entity_type == 'division') {
            a.href = '/scout/app/user/' + sg.EMPLOYEE_ID;
            a.innerText = formName(sg);
        } else if (global_entity_type == 'area') {
            a.href = '/scout/app/division/' + sg;
            a.innerText = subgroup[sg];
        }
        tdn.appendChild(a);
        tr.appendChild(tdn);
        if (global_entity_type == 'division') {
            var tdj = cr('td','division_person_job_td',sg.JOB_CODE_DS);
            tr.appendChild(tdj);
        }
        table.appendChild(tr);
    });
    target.appendChild(table);
};

var showGroupHeader = function(info, target) {
    var table = cr('table','group_header_table');
    var tr = cr('tr');
    table.appendChild(tr);
    var td0 = cr('td');
    td0.style.width = '205px';
    var td1 = cr('td');
    tr.appendChild(td0);
    tr.appendChild(td1);

    var d1 = cr('div','group_top_name_div',info.name);
    var d2 = null;
    if (global_entity_type == 'division') {
        d2 = cr('div','group_second_name_div');
        var a1 = cr('a',null,info.area);
        a1.href = '/scout/app/area/' + info.code.substr(0,2);
        d2.appendChild(a1);
    }
    var d3 = null;
    if (info.websites) {
        d3 = cr('div','group_links');
        var ul = cr('ul','group_links_list');
        d3.appendChild(ul);
        info.websites.forEach((website) => {
            var url = website.url;
            var label = website.label;
            if (!label) {
                if (info.websites.length == 1) {
                    label = info.name + ' website';
                } else {
                    label = url;
                }
            }
            var a = cr('a','group_link',label);
            a.href = url;
            var li = cr('li','group_link');
            li.appendChild(a);
            ul.appendChild(li);
        });
    }

    td1.appendChild(d1);
    if (d2) td1.appendChild(d2);
    if (d3) td1.appendChild(d3);

    if (info.photo_data) {
        var i1 = cr('img','group_icon');
        var data = 'data:' + info.photo_type + ';base64,' + info.photo_data;
        i1.src = data;
        i1.style.width = '200px';
        i1.style.height= '200px';
        td0.appendChild(i1);
    }
    target.appendChild(table);

    // Maybe this will help with SEO:
    document.
        querySelector('meta[name="description"]')
        .setAttribute("content", 
            'Berkeley Lab profile for ' + info.name + ' ' +
            global_entity_type);
    document.
        querySelector('meta[name="keywords"]')
        .setAttribute("content", 
            ['profile','LBL','LBNL','Berkeley Lab',
                info.name + ' ' + global_entity_name,
            ].join(','));
    document.
        querySelector('meta[name="robots"]')
        .setAttribute("content", 'index,follow');
    document.title = info.name + ' ' + global_entity_name + ' at Berkeley Lab';
};



var current_group = null;

var init = function() {

    var tabbedcontent = new TabbedContent({
        id_base: 'thetabs',
    });
    var search_term = gebi('starting_search').value;
    if (search_term == '___null_search___') {
        gebi('body').appendChild(cr('p',null,'No search provided'));
    } else {
        waitBox('show');
        lookupGroupByID(search_term,(err,res) => {
            if (err) return;
            current_group = res;
            showGroupHeader(current_group, gebi('info_div'));
            var tab_subgroup_div = cr('div');
            lookupSubGroup(res, tab_subgroup_div);
            var tcontent_config = [];
            if (current_group.overview) {
                var d = cr('div','division_overview');
                d.innerHTML = current_group.overview;
                tcontent_config.push({
                    name:'overview',
                    content: d,
                });
            }
            var subgroup_label = 
                (global_entity_type == 'area') ? 'divisions' :
                'people';
            tcontent_config.push({
                name:subgroup_label,
                content: tab_subgroup_div,
                label:subgroup_label,
            });
            gebi('everything_container').appendChild(tabbedcontent.create(tcontent_config));
            waitBox('hide');
        });
    }

    gebi('banner').addEventListener('click',(ev) => {
        window.location.href = '/scout/app/profiles/';
    });
};

