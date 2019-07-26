/* jshint esversion:6 */

var Formalizer = function(target, name, url) {
    this.url = url;
    this.name = name;
    this.target = target;
    this.timer = null;
    this.fcfg = null;
    this.userdata = null;
};


Formalizer.prototype.init = function(cb) {
    GetJS(this.url + '/' + this.name,(err,res) => {
        if (err) return cb(err);
        this.title = res.title;
        this.fcfg  = res.elements;
        this.userdata = res.userdata;
        this.createForm();
        return cb();
    });
};

Formalizer.prototype.readForm = function() {
    var formdata = {};
    this.fcfg.forEach((elcfg) => {
        var felem = gebi('form_' + this.name + '_elem_' + elcfg.id);
        var value = null;
        if (elcfg.type == 'checkbox') {
            value = felem.checked;
        } else {
            value = felem.value;
        }
        if (value !== null) formdata[elcfg.id] = value;
    });
    console.log(JSON.stringify(formdata,null,2));
    return formdata;
};

Formalizer.prototype.validateForm = function(formdata) {
    errors = {};
    this.fcfg.forEach((elcfg) => {
        var id = elcfg.id;
        var valfn = elcfg.valfn;
        if (valfn) {
            var valres = valfn(formdata[id]);
            if (valres) errors[id] = valres;
        }
    });
    return errors;
};

Formalizer.prototype.saveChanges = function(formdata,cb) {
    this.in_flight = true;
    PostJS(this.url + '/' + this.name, formdata, (err,res, status) => {
        if (err) return cb(err,res);
        if (status != 200) return cb('not_success',res);
        this.in_flight = false;
        return cb(null,res);
    });
};

Formalizer.prototype.preUpload = function(ev) {
    console.log('preUpload()');

    // if a save is underway, defer this call until later by 
    // reissuing a user key event
    if (this.in_flight) this.userInput();

    var formdata = this.readForm();
    var errors = this.validateForm(formdata);
    var stat_div = gebi('status_' + this.name);
    var errdiv = cr('div','form_data_not_valid');
    errdiv.appendChild(cr('p',null,'Data not saved. There are validation errors:'));
    if (Object.keys(errors).length) {
        var ul = cr('ul');
        Object.keys(errors).forEach((vname) => {
            var li = cr('li',null,vname + ': ' + errors[vname]);
            ul.appendChild(li);
        });
        removeChildren(stat_div);
        stat_div.appendChild(errdiv);
        errdiv.appendChild(ul);
        return;
    }

    this.saveChanges(formdata, (err, resp) => {
        var stat_div = gebi('status_' + this.name);
        removeChildren(stat_div);
        if (err) {
            var errdiv = cr('div','form_data_save_failed','data save failed');
            stat_div.appendChild(errdiv);
            return;
        }
        var okdiv = cr('div','form_data_saved','Autosaved ' + (new Date().toISOString()));
        stat_div.appendChild(okdiv);
    });

    console.log('errors',JSON.stringify(errors,null,2));
};

Formalizer.prototype.userInput = function(ev) {
    console.log('userInput()');
    if (this.timer) {
        clearTimeout(this.timer);
    }
    this.timer = setTimeout((ev) => {
        this.preUpload();
    },1000);
};

Formalizer.prototype.createForm = function() {
    fcfg = this.fcfg;
    if (!fcfg) {
        console.error('no form config loaded');
        return;
    }

    var stat_div = cr('div','form_status');
    stat_div.id = 'status_' +  this.name;
    var tdiv = cr('div','form_container');
    var table = cr('table','form_table');
    tdiv.appendChild(table);

    fcfg.forEach((elcfg) => {
        var userval = null;
        if (this.userdata && this.userdata[elcfg.id]) {
            userval = this.userdata[elcfg.id];
        } else {
            userval = elcfg.deflt;
        }

        if (elcfg.validator) {
            try {
                /* jshint ignore:start */
                var vfun = Function.apply(null, elcfg.validator);
                /* jshint ignore:end */
                elcfg.valfn = vfun;
            } catch (e) {
                console.error('could not eval validator text', e);
            }
        } else {
            elcfg.valfn = function(v) { return null; };
        }

        var etr = cr('tr','form_row');
        var etdl = cr('td','form_label_td');
        var etde = cr('td','form_element_td');
        table.appendChild(etr);
        etr.appendChild(etdl);
        etr.appendChild(etde);

        if (elcfg.label) {
            var lblspan = cr('span',null,elcfg.label);
            if (elcfg.label_class) lblspan.className = elcfg.label_class;
            etdl.appendChild(lblspan);
        }

        var elem = null;
        switch (elcfg.type) {
            case 'date': 
            case 'time': 
            case 'datetime-local': 
            case 'email': 
            case 'number': 
            case 'month': 
            case 'week': 
            case 'url': 
            case 'range': 
            case 'text': {
                elem = cr('input');
                elem.type = elcfg.type;
                if (userval) elem.value = userval;
                if ((elcfg.type == 'number') || (elcfg.type == 'range')){
                    if (elcfg.max) elem.max = elcfg.max;
                    if (elcfg.min) elem.min = elcfg.min;
                }
                break;
            }
            case 'select': {
                elem = cr('select');
                elcfg.options.forEach((elopt) => {
                    var opt = cr('option');
                    opt.value = elopt.idx;
                    opt.text = elopt.name;
                    if (opt.dflt) opt.selected = 'selected';
                    elem.appendChild(opt);
                });
                break;
            }
            case 'textarea': {
                elem = cr('textarea');
                if (elcfg.row) elem.rows = elcfg.rows;
                if (elcfg.cols) elem.cols = elcfg.cols;
                if (userval) elem.value = userval;
                break;
            }
            case 'checkbox': {
                elem = cr('input');
                elem.type = 'checkbox';
                if (userval) elem.checked = true;
                break;
            }
            default:
                ediv.innerText = 'Err: unknown input type';
        }

        if (elem) {
            elem.id = 'form_' + this.name + '_elem_' + elcfg.id;
            if (elcfg.input_class) elem.className = elcfg.input_class;
            if (elcfg.size)        elem.size = elcfg.size;
            if (elcfg.pattern)     elem.pattern = elcfg.pattern;
            elem.addEventListener('change',(ev) => {
                this.userInput();
            });
            elem.addEventListener('keyup',(ev) => {
                this.userInput();
            });
            etde.appendChild(elem);
        }
    });
    removeChildren(this.target);
    if (this.title) {
        var title_div = cr('div','form_title',this.title);
        this.target.appendChild(title_div);
    }
        
    this.target.appendChild(tdiv);
    this.target.appendChild(stat_div);
};

