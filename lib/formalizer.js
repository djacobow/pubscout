/* jshint esversion:6 */

var Formalizer = function(formscfg, sp, savefn, loadfn) {
    this.forms = formscfg;
    this.sp    = sp;
    this.savefn = savefn;
    this.loadfn = loadfn;
};

Formalizer.prototype.init = function(cb) {
    return cb();
};

Formalizer.prototype.setupRoutes = function(router) {
    router.get('/:name/', this.formGetter.bind(this));
    router.post('/:name/', this.formSaver.bind(this));
};

Formalizer.prototype.formGetter = function(req, res) {
    var user = this.sp.getUser(req);
    if (user) {
        var form_name = req.params.name;
        if (form_name && this.forms[form_name]) {
            var formcfg = this.forms[form_name];

            this.loadfn(user, form_name, formcfg, (lerr,lres) => {
                var rval = {
                    title: formcfg.title,
                    elements: formcfg.elements,
                };

                if (lerr) {
                    return res.json(rval);
                }
                rval.userdata = lres;
                return res.json(rval);
            });
        } else {
            res.status(404);
            return res.json({message:'form not found'});
        }
    } else {
        res.status(403);
        return res.json({message:'not auth'});
    }
};


var arraysAreSame = function(a0, a1) {
    if (a0.length != a1.length) return false;
    for (var i=0;i<a0.length; i++) {
        if (a0[i] != a1[i]) return false;
    }
    return true;
};

Formalizer.prototype.formSaver = function(req, res) {
    var user = this.sp.getUser(req);
    if (user) {
        var form_name = req.params.name;
        var form_data = req.body;
        if (!form_name || !this.forms[form_name]) {
            res.status(404);
            return res.json({message: 'unknown form'});
        }
        if (!form_data) {
            res.status(400);
            return res.json({message:'missing form data'});
        }

        var ret_keys = Object.keys(form_data).sort();
        var src_keys = (this.forms[form_name].elements).map((e) => { return e.id; }).sort();
        if (!arraysAreSame(ret_keys,src_keys)) {
            res.status(400);
            return res.json({message:'return data does not match form'});
        }

        this.savefn(user, form_name, form_data, (serr,sres) => {
            if (serr) {
                res.status(500);
                return res.json({message:'form save failed', err: serr, result: sres});
            }
            res.status(200);
            return res.json({message: 'form save succeeded', result: sres});
        });
    }
};

module.exports = Formalizer;
