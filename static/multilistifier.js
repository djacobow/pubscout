/* jshint esversion:6 */

var MultiLister = function(config) {
    this.urls = config.urls;
    this.postReload = config.postReload;
    this.preReload = config.preReload;
    this.table_configs = config.tables;
    this.getCurrentUserID = config.getCurrentID;
    this.tdata = null;
};

MultiLister.prototype.reload = function(empid) {
    if (!empid) empid = this.getCurrentUserID();

    if (empid) {

        var things_to_do = [];
        this.urls.forEach((inurl) => {
            pvars = [ ['q', empid], ];
            if (this.filt) pvars.push(['extras', JSON.stringify(this.filt)]);
            var params = pvars.map((param) => {
                return param[0] + '=' + encodeURIComponent(param[1]); 
            }).join('&');
            if (Array.isArray(inurl)) {
                things_to_do.push({url: inurl[0] + '?' + params, name: inurl[1]});
            } else {
                things_to_do.push({url: inurl + '?' + params, name: null});
            }
        });

        if (this.preReload) this.preReload(null);
        this.tdata = {};
        doAsyncThings(things_to_do,(thing, cb) => {
            GetJS(thing.url,  cb);
        }, (all_results) => {
            all_results.forEach((result) => {
                var name   = result[0].name;
                var geterr = result[1];
                var reserr = null;
                if (!geterr) reserr = result[2].err;
                if (!geterr && !reserr) {
                    resarry = result[2].result;
                    if (name) {
                        this.tdata[name] = resarry;
                    } else {
                        Object.keys(resarry[0]).forEach((groupname) => {
                            this.tdata[groupname] = resarry[0][groupname];
                        });
                    }
                }
            });
            this.populateLists();
        });
    } 
};

MultiLister.prototype.setData = function(tname, data) {
    if (!this.tdata) this.tdata = {};
    this.tdata[tname] = data;
    this.populateLists();
};

MultiLister.prototype.populateOne = function(item, args, number) {
    var config  = args[0];
    var target  = args[1];
    var row     = cr('tr');
    // console.log(config);
    var subconfigs = [ config ];
    if ((typeof config == 'object') && !Array.isArray(config)) {
        subconfigs = Object.values(config);
        //console.log(subconfigs);
    }

    subconfigs.forEach((subconfig) => {
        var td = cr('td');
        row.appendChild(td);
        bagToDOM(td, subconfig, item, this);
    });
    target.appendChild(row);
};

MultiLister.prototype.populateLists = function() {
    var listresults = {};
    this.table_configs.forEach((tconfig) => {
        var table_name = tconfig.table_name || tconfig.source_name;
        var table_data = this.tdata[tconfig.source_name];
        if (table_data && Array.isArray(table_data) && table_data.length) {
            if (tconfig.sortfn) {
                table_data.sort((a,b) => { return tconfig.sortfn(a,b,this); });
            }
            if (tconfig.filtfn) {
                table_data = table_data.filter((a) => {
                    return tconfig.filtfn(a,this); 
                });
            }
            var table = this.populateList(table_data, tconfig);
            if (table) {
                listresults[table_name] = { table: table, label: tconfig.label };
            }
        }
    });
    if (this.postReload) this.postReload(null,listresults);
};

MultiLister.prototype.populateList = function(tdata, tconfig) {
    if (tdata.length) {
        var table = cr('table');
        if (tconfig.table_class) table.classList.add(tconfig.table_class);
        arrayForEach(tdata, this.populateOne.bind(this), [tconfig.display_params, table]);
        return table;
    }
    return null;
};

