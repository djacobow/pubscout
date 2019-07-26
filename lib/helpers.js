/* jshint esversion:6 */

const Base32 = require('./base32.js');
const parse = require('csv-parse/lib/sync');

var http = require('http');

var GetJS = function(url,cb) {
    var complete = false;
    try {
        http.get(url,(resp) => {
            var dstr = '';
            resp.on('data',(chunk) => {
                dstr += chunk;
            });
            resp.on('end',() => {
                try {
                    var data = JSON.parse(dstr);
                    complete = true;
                    return cb(null,data);
                } catch (endexp) {
                    if (!complete) return cb(endexp,null);
                }
            });
            resp.on('error',(err) => {
                complete = true;
                if (!complete) return cb(err,null);
            });
        });
    } catch (oexp) {
        if (!complete) return cb(oexp,null);
    }
};

var csvToJS = function(csvdata, keyname) {
    var data = parse(csvdata, {columns:true});
    var rv = {};
    data.forEach((datum) => {
        rv[datum[keyname]] = datum;
    });
    return rv;
};

var csvToJS_old = function(csvdata, keyname) {
    var varlist = [];
    var count = -1;
    var rval = {};
    console.debug('C 0');
    data = parse(csvdata);
    console.debug('C 1');
    data.forEach((row) => {
        if (count == -1) {
            varlist = row;
        } else {
            var item = {};
            for (var i=0;i<row.length;i++) {
                item[varlist[i]] = row[i];
            }
            rval[item[keyname]] = item;
        }
        count += 1;
    });
    return rval;
};

var flipKey = function(din, nk) {
    dout = {};
    Object.keys(din).forEach(function(inid) {
        initem = din[inid];
        nkv = initem[nk];
        if ((nkv !== null) && 
            (nkv !== undefined) && 
            (
             (typeof nkv == 'number') || 
             ((typeof nkv =='string') && nkv.length)
            )
           ) {
            dout[nkv] = initem;
        }
    });
    return dout;
};

var arrayToDictBy = function(ain, kname, lowercase = false) {
    var breaker = 0;
    ohash = {};
    ain.forEach((elem) => {
        var kval = null;
        if (Array.isArray(kname)) {
            var i = 0;
            while (!kval && (i<kname.length)) {
                kval = elem[kname[i]];
                i += 1;
            }
        } else {
            kval = elem[kname];
        }
        if (Array.isArray(kval)) {
            kval = kval[0];
        }
        if (kval) {
            if (lowercase) kval = kval.toLowerCase();
        }

        if (ohash.hasOwnProperty(kval)) {
            kval = kval.toString() + '_' + breaker.toString;
            breaker += 1;
        }


        ohash[kval] = elem;
    });
    if (breaker) console.warn(breaker.toString() + ' repeated keys');
    return ohash;
};

var isDict = function(o) {
    var obj = typeof o === 'object';
    var notarry = !Array.isArray(o);
    var notdate = !(o instanceof Date);
    return (obj && notarry && notdate);
};

var fixOrgNames = function(rawdata) {
    var div_decoder = {
        "Energy Analysis Env Impacts": 'Energy Analysis & Environmental Impacts',
        "Accelerator Tech-Applied Phys": 'Accelerator Technology & Applied Physics',
        "Energy Storage & Distributed R": 'Energy Storage & Distributed Resources',
        "Bldg Technology Urban Systems": 'Building Technology & Urban Systems',
        "Climate & Ecosystems": 'Climate & Ecosystem Sciences',
        "Molecular Biophys & Integ Bio": 'Molecular Biophysics & Integrated BioImaging',
        "Biological Systems & Eng": 'Biological Systems & Engineering',
        "Environ Genomics & Systems Bio": 'Environmental Genomics & Systems Biology',
        "NERSC": 'National Energy Research Supercomputing Center (NERSC)',
        // "Computing": 'Computational Research',
        "Scientific Networking": 'Scientific Networking (ESNet)',
        };

    Object.values(rawdata).forEach((e) => {
        e.ORG_LEVEL1_NM = div_decoder[e.ORG_LEVEL1_NM] || e.ORG_LEVEL1_NM;
    });
};

// LBL HR puts bigwigs in their own category rather
// in the organizations they lead. This adjustment
// fixes that.
var fixSpecials =function(rawdata) {
    var specials = [
        [ '047444', 'PS', 'PH', ], // Witherell                                 
        [ '286403', 'CS', 'NE', ], // Simon                                     
        [ '034022', 'BS', 'AB', ], // Maxon                                     
        [ '353603', 'CE', 'NE', ], // Yelick                                    
        [ '009795', 'ES', 'MF', ], // Neaton                                    
        [ '876668', 'PS', 'AF', ], // Symons                                    
        [ '012027', 'AE', 'AD', ], // Ramesh                                    
        [ '862501', 'AU', 'AU', ], // Hubbard                                   
        [ '173451', 'ES', 'ES', ], // DePaolo                                   
        [ '345201', 'BS', 'BS', ], // Keasling
        [ '044461', 'AE', 'ED', ], // Prasher 
    ];
    specials.forEach((special) => {
        rawdata[special[0]].ORG_LEVEL0_CD = special[1];
        rawdata[special[0]].ORG_LEVEL1_CD = special[2];
    });
};


// Employee IDs are somewhat private, so we issue a simple 
// obfuscation here so that all IDs in the system are hidden.
// This is probably more complicated than it needs to be.
const secret = [ 
0xd3, 0xf2, 0xa9, 0x85, 0x44, 0xc4, 0x9e,
0x55, 0x08, 0x9a, 0x0c, 0xcd, 0x06, 0xf4,
0x17, 0x04, 0xaa, 0x53, 0xd0, 0x92, 0xc5,
0x26, 0xe9, 0x25, 0xfa, 0x5d, 0xd1, 0x2c,
0xac, 0x08, 0x6a, 0x59,
];
var reverseByte = function(x) {
    x = ((x & 0x0f) << 4) | ((x & 0xf0) >> 4);
    x = ((x & 0x33) << 2) | ((x & 0xcc) >> 2);
    x = ((x & 0x55) << 1) | ((x & 0xaa) >> 1);
    return x;
};


var obfuscateID = function(instr) {
    var cbytes = instr.split('').reverse().map((oldch,i) => {
        return reverseByte(oldch.charCodeAt(0)) ^ secret[i % secret.length];
    });
    var b32 = new Base32();
    return b32.encode(cbytes);
};

/*
// shorter and more correct but those long digests are ugly.
const crypto = require('crypto');
var obfuscateID = function(instr) {
    var hash = crypto.createHash('sha256');
    hash.update(instr);
    return hash.digest('hex');
};
*/


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



module.exports = {
    csvToJS: csvToJS,
    flipKey: flipKey,
    arrayToDictBy: arrayToDictBy,
    isDict:isDict,
    fixSpecials: fixSpecials,
    obfuscateID: obfuscateID,
    Base32: Base32,
    fixOrgNames: fixOrgNames,
    GetJS: GetJS,
    doAsyncThings: doAsyncThings,
};


