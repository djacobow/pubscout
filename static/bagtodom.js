/* jshint esversion:6 */
var bagToDOM = function(target, things_to_make, item, caller_this) {

    var createIfExists = function(item, thing) {
        var type      = thing[0];
        var varname   = thing[1];
        var classname = thing[2];
        var fn        = thing[3];

        var has_text, has_child;

        if (varname !== null) {
            var val       = item[varname];
            var not_nothing = 
                (val !== undefined) &&
                (val !== null);
            var valt = 'nothing';
            if (not_nothing) valt = typeof val;

            if ((valt == 'string') && !val.length) not_nothing = false;
            if (Array.isArray(val) && !val.length) not_nothing = false;

            if (not_nothing) {
                var d = cr(type,classname);
                if (fn) {
                    try {
                        fn(d,item[varname],item,caller_this);
                    } catch (e) {
                        d.innerText = e;
                    }
                } else {
                    d.innerText = item[varname];
                }
                has_text = d.innerText && d.innerText.length;
                has_child = d.firstChild;
                if (!has_text && !has_child) return null;
                return d;
            } else {
                if (item[varname] !== null) {
                    if (false) {
                        console.log(varname, item[varname], typeof item[varname]);
                    }
                }
            }
        } else {
            if (fn) {
                var e = cr(type,classname);
                try {
                    fn(e,item,caller_this);
                } catch (ex) {
                    e.innerText = ex;
                }
                has_text = e.innerText && e.innerText.length;
                has_child = e.firstChild;
                if (!has_text && !has_child) return null;
                return e;
            }
        }
        return null;
    };

    things_to_make.forEach((group) => {
        var d = cr('div');
        group.forEach((thing, i) => {
            var s = createIfExists(item,thing);
            if (s) {
                d.appendChild(s);
                d.appendChild(cr('span',null,' | '));
            }
        });
        if (d.lastChild) d.removeChild(d.lastChild);
        target.appendChild(d);
    });

    if (false) {
        var pre = cr('pre',null,JSON.stringify(item,null,2));
        target.appendChild(pre);
    }
};


