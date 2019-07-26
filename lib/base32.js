/* jshint esversion: 6 */

var Base32 = function() {
    this.debug = false;
    this.dictionary = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3',
        '4', '5',
    ];
    this.rdictionary = {};
    this.dictionary.forEach((v,i) => {
        this.rdictionary[v] = i;
    });
    Base32.prototype.showBits = function(b,l=8) {
        var n = b.toString(2);
        var zeros = Array(l).fill('0').join('');
        n = zeros.substr(n.length) + n;
        return n;
    };
    Base32.prototype.decode = function(istr) {
        var infives = istr.split('').map((x) => { return this.rdictionary[x]; });
        if (this.debug) console.debug('infives',infives.map((x) => { return this.showBits(x,5); }).join('_'));
        var bits = infives.length * 5;
        var bp = 0;
        var obytes = [];
        while (bp < bits) {
            var bpmod5 = bp % 5;
            var i5idx  = Math.floor(bp / 5);
            var w10_u = (i5idx < (infives.length-2)) ? infives[i5idx+2] : 0;
            var w10_m = (i5idx < (infives.length-1)) ? infives[i5idx+1] : 0;
            var w10_l = (infives[i5idx] & 0x1f);
            w10 = (w10_u << 10) | (w10_m << 5) | (w10_l);
            var obyte = (w10 >> bpmod5) & 0xff;
            if (this.debug) {
                var w10x = ((w10 & 0x01e0) >> 5).toString(16) + '_' +  (w10 & 0x1f).toString('16');
                var w10b = this.showBits((w10 & 0x01e0) >> 5,5) + '_' +  this.showBits(w10 & 0x1f,5);
                console.debug('bp ',bp,' mod5 ',bpmod5,' byteidx ',i5idx,' w10 ',w10x,
                    ' w10b ', w10b, ' obyte ',obyte.toString(16),' obyteb ', this.showBits(obyte));
            }
            obytes.push(obyte);
            bp += 8;
        }
        var ostr = obytes.map((b) => { return String.fromCharCode(b); }).join('');
        if (this.debug) {
            console.debug('ostr',ostr);
        }
        return obytes;
    };

    Base32.prototype.encode = function(inbytes) {
        if (this.debug) console.debug('Cbytes: ' + inbytes.map((x) => { return x.toString(16); }).join('_'));
        var bits = inbytes.length * 8;
        var bp = 0;
        cfives = [];
        while (bp < bits) {
            var bpmod8  = bp % 8;
            var byteidx = Math.floor(bp / 8);
            var w16 = (byteidx < (inbytes.length-1)) ? inbytes[byteidx+1] : 0;
            w16 = (w16 << 8) | inbytes[byteidx];
            var bits5 = (w16 >> bpmod8) & 0x1f;
            if (this.debug) {
                var w16x = ((w16 & 0xff00) >> 8).toString(16) + '_' +  (w16 & 0xff).toString('16');
                var w16b = this.showBits((w16 & 0xff00) >> 8) + '_' +  this.showBits(w16 & 0xff);
                console.debug('bp ',bp,' mod8 ',bpmod8,' byteidx ',byteidx,' w16 ',w16x,
                    ' w16b ', w16b, ' bits5 ',this.showBits(bits5));
            }
            bp += 5;
            cfives.push(bits5);
        }
        return cfives.map((bits5) => { return this.dictionary[bits5]; }).join('');
    };
};

module.exports = Base32;

