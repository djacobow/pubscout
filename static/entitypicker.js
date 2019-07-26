/* jshint esversion:6 */

var entityPicker = function(config) {
    this.config = config;
    this.entities = null;
    this.selectFn = null;
    this.matches = {};
    this.current_entid = null;
    this.target = this.setQBoxTarget();
};

entityPicker.prototype.setQBoxTarget = function() {
    var qbcfg = this.config.query_box;
    var tgt = null;
    if (qbcfg && qbcfg.target) {
        if (typeof qbcfg.target == 'string')
            tgt = gebi(qbcfg.target);
        if (isElement(qbcfg.target)) {
            tgt = qbcfg.target;
        }
    }
    if (!tgt) {
        tgt = gebi('name_div');
    }
    if (!tgt) {
        tgt = cr('div');
        document.getElementsByTagName('body')[0].appendChild(tgt);
    }
    return tgt;
};

entityPicker.prototype.setLoadFn = function(lf) {
    this.selectFn = lf;
};

entityPicker.prototype.showEntityData = function(ev) {
    var entid = this.current_entid;
    var entity = this.getEntityByID(entid);

    var vars_of_interest = this.config.vars_of_interest;


    var tthis = this;
    var finishShow = function() {
        var divud = gebi(tthis.config.query_box.userdata.id);
        divud.style.display = 'block';
        removeChildren(divud);

        Object.keys(vars_of_interest).forEach((source) => {
            var t = cr('table','user_info');
            var tr = cr('tr');
            var trth0 = cr('th',null,'Variable');
            var trth1 = cr('th',null,'Value');
            trth0.width = '20%';
            trth1.width = '80%';
            tr.appendChild(trth0);
            tr.appendChild(trth1);
            t.appendChild(tr);
            vars_of_interest[source].forEach((v) => {
                tr = cr('tr');
                var td0 = cr('td');
                var td1 = cr('td');
                t.appendChild(tr);
                tr.appendChild(td0);
                tr.appendChild(td1);
                td0.innerText = v;
                td1.innerText = entities[source][v] || '';
            });
            divud.appendChild(cr('div','user_data_header','Data from ' + source));
            divud.appendChild(t);
        });
    };

    var entities = {
        hr: entity,
        sympl: {},
    };


    if (this.config.sympl_lookup && this.config.id_getter) {
        var eppn = this.config.id_getter(entity);
        GetJS('/scout/api/v1/query/users/byeppn?q=' + eppn,function(err,res) {
            if (!err && res && res.result && res.result.length) {
                entities.sympl = res.result[0];
            }
            finishShow(entities);
        });
    } else {
        finishShow(entities);
    }
        
};

entityPicker.prototype.finalizeSelection = function(entid) {
    this.current_entid = entid;
    var entity = this.getEntityByID(entid);
    if (this.selectFn) this.selectFn();
};

entityPicker.prototype.searchFor = function() {
    var str = gebi(this.config.query_box.search.input.id).value;
    var re  = new RegExp(str,'gi');
    this.matches = {};
    var idname = this.config.query_box.select.dropdown.index;
    var descrname = this.config.query_box.select.dropdown.value;

    // The search string exactly matches an ID
    if (this.entities[str]) {
        gebi(this.config.query_box.search.input.id).value = 
            this.entities[str][descrname];
        this.finalizeSelection(str);
    } else {

        // Otherwise we search by name
        Object.values(this.entities).forEach((item) => {
            if (item[descrname] && item[descrname].match(re)) {
                this.matches[item[idname]] = item;
            }
        });
        this.populateSelectBox(this.matches);
        if (Object.keys(this.matches).length == 1) {
            var entid = gebi(this.config.query_box.select.id).value;
            this.finalizeSelection(entid);
        }
    }
};

entityPicker.prototype.populateSelectBox = function(matches) {
    var sel = gebi(this.config.query_box.select.id);
    while (sel.options.length) sel.remove(0);

    var opt = cr('option');
    var entids = Object.keys(matches);
    var ct = entids.length;
    
    if (ct > 1) {
        opt.textContent = 'Select from ' + ct + ' below.';
        opt.value = '__null__';
        sel.appendChild(opt);
    }

    if (ct) {
        addRemoveClasses(sel,'picker_selector_nonempty','picker_selector_empty');
    } else {
        addRemoveClasses(sel,'picker_selector_empty','picker_selector_nonempty');
    }

    if (this.config.query_box.select.dropdown.sortfn) {
        entids.sort((a,b) => {
            return this.config.query_box.select.dropdown.sortfn(matches[a],matches[b]);
        });
    }

    entids.forEach((entid) => {
        var opt = cr('option');
        opt.textContent = matches[entid][this.config.query_box.select.dropdown.value];
        opt.value = entid;
        sel.appendChild(opt);
    });
};

entityPicker.prototype.getCurrentID = function() {
    return this.current_entid;
};

entityPicker.prototype.makeQueryBox = function() {
    var cfg = this.config.query_box;
    label = cr(cfg.search.label.type,cfg.search.label.cname,cfg.search.label.text);
    if (cfg.search.label.id) label.id = cfg.search.label.id;

    var input = cr('input');
    input.id = cfg.search.input.id || 'ppsearch';
    input.addEventListener('keyup', this.searchFor.bind(this));

    removeChildren(this.target);
    this.target.className = 'name_div_ready';
    this.target.appendChild(label);
    this.target.appendChild(input);

    var starting_search = gebi(this.config.query_box.intitial_search_terms);
    if (starting_search) {
        var ss_val = starting_search.value;
        if (ss_val != '___null_search___') {
            input.value = ss_val;
            setTimeout((tm) => {
                input.dispatchEvent(new Event('keyup'));
            },200);
        }
    }

    var selector = cr('select');
    selector.classList.add('picker_selector_empty');
    selector.id = cfg.select.id || 'ppselect';

    if (cfg.select.label) {
        var l = cr(cfg.select.label.type,cfg.select.label.cname,cfg.select.label.text);
        this.target.appendChild(l);
    }
    this.target.appendChild(selector);

    selector.addEventListener('change',(ev) => {
        this.finalizeSelection(selector.value);
    });

    if (!cfg.userdata.hasOwnProperty('show') || cfg.userdata.show) {
        var showubtn = cr('button',cfg.userdata.button.cname,cfg.userdata.button.text);
        var udiv     = cr(cfg.userdata.type, cfg.userdata.cname);
        udiv.id      = cfg.userdata.id || 'user_data';
        showubtn.addEventListener('click',(ev) => {
            this.showEntityData();
        });
        udiv.addEventListener('click',(ev) => {
            udiv.style.display = 'none';
        });
        this.target.appendChild(showubtn);
        this.target.appendChild(udiv);
    }
};

entityPicker.prototype.getEntityByID = function(entid) {
    if (this.entities && this.entities.hasOwnProperty(entid)) {
        return this.entities[entid];
    }
    return null;
};

entityPicker.prototype.loadEntities = function(filter, cb) {
    if (!filter) filter = function() { return true; };
    GetJS(this.config.list_url, (err,res) => {
        if (err) return cb(err);
        this.entities = {};
        if (this.config.create_query_box && this.config.query_box) {
            res.result.forEach((entity) => {
                var idname = this.config.query_box.select.dropdown.index;
                if (entity.hasOwnProperty(idname) && 
                    entity[idname] &&
                    filter(entity[idname], entity)) {
                    this.entities[entity[idname]] = entity;
                }
            });
        }
        return cb();
    });
};

entityPicker.prototype.init = function(cb) {
    var tthis = this;
    this.loadEntities(this.config.load_filter, (err) => {
        if (this.config.create_query_box) this.makeQueryBox();
        cb();
    });
};


