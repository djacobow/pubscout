/* jshint esversion:6 */

// shorthand for createElement
function cr(what,clsn = null, it = null) {
    var x = document.createElement(what);
    if (clsn) {
        x.className = clsn;
    }
    if (it) {
        x.innerText = it;
    }
    return x;
}

function gebi(en) {
    return document.getElementById(en);
}

function exTrue(x,y) { return (x.hasOwnProperty(y) && x.y); }

function removeChildren(e) {
    if (typeof e === 'string') {
        e = document.getElementById(e);
    }
    while (e.firstChild) e.removeChild(e.firstChild);
    return e;
}

function PostJS(url, pdata, cb) {
    var xhr = new XMLHttpRequest();
    xhr.onerror = function(e) {
        return cb('http_error',e);
    };
    xhr.onload = function() {
        if (xhr.status == 403) location.reload();
        console.log(xhr.responseText);
        var data = null;
        try {
            data = JSON.parse(xhr.responseText);
        } catch(e) {
            console.log('json no parsey');
            return cb('resp_no_parse',{resp:xhr.resonseText});
        }
        return cb(null, data, xhr.status);
    };
    xhr.open('POST',url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(pdata));
}

function GetJS(url,cb) {
    var xhr = new XMLHttpRequest();
    xhr.onerror = function(e) { 
        return cb('fetch_err',e);
    };
    xhr.onload = function() {
        if (xhr.status == 403) location.reload();
        var data = null;
        if (xhr.status == 204) {
            return cb('no content');
        }
        try {
            data = JSON.parse(xhr.responseText);
        } catch (e) {
            console.log('json no parsey',e);
            return cb('rdata did not parse', {responseText:xhr.responseText});
        }
        return cb(null, data);
    };
    xhr.open('GET',url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
}

// take two existing elements, and let clicks on one set visibility
// attributes for the other
function hidify(hider, hidee, hiderlabels = []) {
    function make_open() {
        hider.innerText = hiderlabels[1] || ' \u25bc ';
        hidee.style.height = hidee.scrollHeight;
        hidee.style.visibility = 'visible';
        hidee.style.opacity = 1;
        hider.setAttribute('open',1);
    }
    function make_closed() {
        hider.setAttribute('open',0);
        hider.innerText = hiderlabels[0] || ' \u25ba ';
        hidee.style.height = 0;
        hidee.style.opacity = 0;
        hidee.style.visibility = 'hidden';
    }

    make_closed();

    hider.addEventListener('click',function(ev) {
        var is_open = hider.getAttribute('open');
        console.log(is_open);
        if (is_open == 1) {
            make_closed();
        } else {
            make_open();
        }
    });
}

// copy the link in a source element to the clipboard,
// by creating an input in a targetElement and selecting it,
// then hiding that element.
var copyToClipboard = function(srcElem,tgtElem) {
    console.log('copyToClipboard');
    removeChildren(tgtElem);
    var c = cr('input');
    c.type = 'text';
    c.value = srcElem.href;
    c.style.opacity = 0;
    c.className = 'copybox';
    c.readOnly = true;
    tgtElem.appendChild(c);
    c.select(); 
    document.execCommand('Copy'); 
    window.setTimeout(function() {
        c.style.opacity = 1;
        window.setTimeout(function() {
            c.style.opacity = 0;
            window.setTimeout(function() {
                removeChildren(tgtElem);
            }, 200);
        },1000);
    },200);
};

// just a little sugar on getting a fake event that
// represents hitting enter in a text input box
function makeEnterKeyEv(source, cb) {
    source.addEventListener('keyup', function(ev) {
        if (ev.keyCode == 13) {
            cb(ev);
        }
    });
}


var arrayForEach = function(inary, fn, args, cb = null) {
    var count = 0;
    inary.forEach((item) => {
        try {
            fn(item, args, count);
        } catch (e) {
            if (cb) return cb(e);
        }
        count += 1;
    });
    if (cb) return cb();
};

var appendChildren = function(elem, elems, splitText = null) {
    for (var i=0;i<elems.length;i++) {
        elem.appendChild(elems[i]);
        if ((splitText !== null) && (i < (elems.length-1))) {
            elem.appendChild(cr('span',null,splitText));
        }
    }
};

//Returns true if it is a DOM node
function isNode(o){
  return (
    typeof Node === "object" ? o instanceof Node : 
    o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
  );
}

//Returns true if it is a DOM element    
function isElement(o){
  return (
    typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
);
}

var addRemoveClasses = function(elem, to_add, to_remove) {
    if (Array.isArray(to_add)) {
        to_add.forEach((c) => { elem.classList.add(c); });
    } else if (to_add) {
        elem.classList.add(to_add);
    }
    if (Array.isArray(to_remove)) {
        to_remove.forEach((c) => { elem.classList.remove(c); });
    } else if (to_remove) {
        elem.classList.remove(to_remove);
    }
    return elem;
};

var SymplDateToFriendly = function(sd) {
    if (typeof sd != 'string') sd = sd.toString();
    var m = sd.match(/^(\d{4})(\d{2})(\d{2})$/);
    var fd = null;
    if (m) {
        var year = parseInt(m[1]);
        var mo   = parseInt(m[2]);
        var day  = parseInt(m[3]);
        if ((mo == 1) && (day == 1)) {
            // probably not reall 1/1 but just unknown date
            fd = year.toString();
        } else {
            var months = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
            ];
            fd = months[mo-1] + ' ' + day.toString() + ', ' + year.toString();
        }
    }
    return fd || sd;
};


// a very minimalist asyncSeries type of fn.
var doAsyncThings = function(things, action, final_cb) {
    var outputs = [];
    things.forEach((thing) => {
        action(thing,(err,res) => {
            outputs.push([thing,err,res]);
            if (outputs.length == things.length) {
                final_cb(outputs);
            }
        });
    });
};


// a very minimalist syncSeries type of fn
var doSyncThings = function(things, action, final_cb) {
    var outputs = [];

    var doNext = function() {
        var current_thing = things.pop();
        if (current_thing) {
            action(current_thing,(err,res) => {
                outputs.push([current_thing,err,res]);
                doNext();
            });
        } else {
            return final_cb(outputs);
        }
    };

    doNext();
};

var formName = function(person) {
    var complete_name = person.FIRST_NM + ' ';
    var mn = person.MIDDLE_NM;
    if (mn && mn.length && !mn.match(/^\s$/)) {
        complete_name += mn;
        complete_name += (mn.length == 1) ? '. ' : ' ';
    }
    complete_name += person.LAST_NM;
    return complete_name;
};


var waitBox = function(what = 'hide') {
    try {
        var wb = gebi('wait_box');
        switch (what) {
            case 'show': 
                wb.style.display = 'table-cell';
                break;
            case 'hide':
                wb.style.display = 'none';
                break;
            default:
                break;
        }
    } catch (e) {}
};

var jsLoad = function(fns, cb) {
    if (typeof fns == 'string') fns = [ fns ];
    doAsyncThings(fns, (fn,fcb) => {
        var se = document.createElement('script');
        se.src = fn;
        se.addEventListener('load',fcb);
        document.getElementsByTagName('head')[0].appendChild(se);
    }, cb);
};



// Implement a simple cache of names looked up from user ids, for use 
// in showing coauthor information. In order for the cache to be useful
// (that is, for it to cut down on extra calls over the API), we must
// issue the requests in series, so that each request can get the benefit
// of those that came before. So, each publication should be handled
// in series, though if there are multiple coauthors for a given publication,
// they can be handled asynchronously.
var CoauthorCache = function(lookupfn) {
    this.cache = {};
    this.work_queue = [];
    this.working = false;
    this.lookupfn = lookupfn;

    CoauthorCache.prototype.lookupUsers = function(list, cb) {
        if ((list !== 'undefined') && list) {
            this.work_queue.push({
                list: list,
                cb: cb
            });
        } else {
            cb();
        }
        if (this.work_queue.length && !this.working) {
            this.working = true;
            var tthis = this;
            var ct = 0;
            doSyncThings(this.work_queue, (qitem, qcb) => {
                tthis._lookupUsers(qitem.list, (res) => {
                    qitem.cb(res);
                    ct += 1;
                    qcb(null, ct);
                });
            }, (ferr, fres) => {
                this.working = false;
            });
        }
    };

    CoauthorCache.prototype._lookupUsers = function(list, cb) {
        var tthis = this;
        doAsyncThings(list, (thing, thingcb) => {
            if (tthis.cache[thing]) {
                return thingcb(tthis.cache[thing].err, tthis.cache[thing].res);
            } else {
                tthis.lookupfn(thing, (err, res) => {
                    tthis.cache[thing] = {
                        err: err,
                        res: res
                    };
                    return thingcb(err, res);
                });
            }
        }, cb);
    };
};
