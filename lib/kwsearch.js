/* jshint esversion:6 */

const MAX_PUBS = 50;

const stopwords = {
 "a": 1,
 "about": 1,
 "above": 1,
 "after": 1,
 "again": 1,
 "against": 1,
 "all": 1,
 "am": 1,
 "an": 1,
 "and": 1,
 "any": 1,
 "are": 1,
 "aren't": 1,
 "as": 1,
 "at": 1,
 "be": 1,
 "because": 1,
 "been": 1,
 "before": 1,
 "being": 1,
 "below": 1,
 "between": 1,
 "both": 1,
 "but": 1,
 "by": 1,
 "can't": 1,
 "cannot": 1,
 "could": 1,
 "couldn't": 1,
 "did": 1,
 "didn't": 1,
 "do": 1,
 "does": 1,
 "doesn't": 1,
 "doing": 1,
 "don't": 1,
 "down": 1,
 "during": 1,
 "each": 1,
 "few": 1,
 "for": 1,
 "from": 1,
 "further": 1,
 "had": 1,
 "hadn't": 1,
 "has": 1,
 "hasn't": 1,
 "have": 1,
 "haven't": 1,
 "having": 1,
 "he": 1,
 "he'd": 1,
 "he'll": 1,
 "he's": 1,
 "her": 1,
 "here": 1,
 "here's": 1,
 "hers": 1,
 "herself": 1,
 "him": 1,
 "himself": 1,
 "his": 1,
 "how": 1,
 "how's": 1,
 "i": 1,
 "i'd": 1,
 "i'll": 1,
 "i'm": 1,
 "i've": 1,
 "if": 1,
 "in": 1,
 "into": 1,
 "is": 1,
 "isn't": 1,
 "it": 1,
 "it's": 1,
 "its": 1,
 "itself": 1,
 "let's": 1,
 "me": 1,
 "more": 1,
 "most": 1,
 "mustn't": 1,
 "my": 1,
 "myself": 1,
 "need": 1,
 "no": 1,
 "nor": 1,
 "not": 1,
 "of": 1,
 "off": 1,
 "on": 1,
 "once": 1,
 "only": 1,
 "or": 1,
 "other": 1,
 "ought": 1,
 "our": 1,
 "ours": 1,
 "ourselves": 1,
 "out": 1,
 "over": 1,
 "own": 1,
 "same": 1,
 "shan't": 1,
 "she": 1,
 "she'd": 1,
 "she'll": 1,
 "she's": 1,
 "should": 1,
 "shouldn't": 1,
 "so": 1,
 "some": 1,
 "such": 1,
 "than": 1,
 "that": 1,
 "that's": 1,
 "the": 1,
 "their": 1,
 "theirs": 1,
 "them": 1,
 "themselves": 1,
 "then": 1,
 "there": 1,
 "there's": 1,
 "these": 1,
 "they": 1,
 "they'd": 1,
 "they'll": 1,
 "they're": 1,
 "they've": 1,
 "this": 1,
 "those": 1,
 "through": 1,
 "to": 1,
 "too": 1,
 "under": 1,
 "until": 1,
 "up": 1,
 "very": 1,
 "was": 1,
 "wasn't": 1,
 "we": 1,
 "we'd": 1,
 "we'll": 1,
 "we're": 1,
 "we've": 1,
 "were": 1,
 "weren't": 1,
 "what": 1,
 "what's": 1,
 "when": 1,
 "when's": 1,
 "where": 1,
 "where's": 1,
 "which": 1,
 "while": 1,
 "who": 1,
 "who's": 1,
 "whom": 1,
 "why": 1,
 "why's": 1,
 "with": 1,
 "won't": 1,
 "would": 1,
 "wouldn't": 1,
 "you": 1,
 "you'd": 1,
 "you'll": 1,
 "you're": 1,
 "you've": 1,
 "your": 1,
 "yours": 1,
 "yourself": 1,
 "yourselves": 1,
};

var KeyWordSearch = function(cfg) {
    this.config = cfg;
    this.stopwords = stopwords;
    this.db = {};
};

KeyWordSearch.prototype.setStopWords = function(words) {
    this.stopwords = {};
    words.forEach((w) => { this.stopwords[w] = 1; });
};

KeyWordSearch.prototype.stringToWords = function(ss) {
    ss = ss.toLowerCase().trim();
    var words = (ss.match(/\b(\w+)\b/g) || []).filter((w) => {
        return (w.length && (w.length >=2) && !this.stopwords.hasOwnProperty(w));
    });
    return words || [];
};


KeyWordSearch.prototype.load = function(indata, textfn) {
    Object.keys(indata).forEach((k) => {
        var text  = textfn(indata[k]);
        var words = this.stringToWords(text);
        words.forEach((w) => {
            if (!this.db[w]) this.db[w] = {};
            if (!this.db[w][k]) {
                this.db[w][k] = 1;
            } else {
                /* this is a tweak factor -- more mentions 
                   should raise score, but sub-linearly so
                   that an article matching a keyworkd many
                   times does not drown out articles
                   matching multiple keywords
                */
                this.db[w][k] *= 1.1;
            }
        });
    });
};

KeyWordSearch.prototype.lookup = function(words) {
    if (typeof words == 'string') {
        words = this.stringToWords(words);
    }
    var rdata = {};
    var seq_multiplier = 1;
    words.forEach((w) => {
        if (this.db[w]) {
            Object.keys(this.db[w]).forEach((k) => {
                if (!rdata[k]) rdata[k] = { score: 0, words: {}};
                rdata[k].score += seq_multiplier * this.db[w][k];
                rdata[k].words[w] = this.db[w][k];
            });
        }
        seq_multiplier /= 1.5;
    });

    // extra points for matching more search terms
    Object.keys(rdata).forEach((k) => {
        rdata[k].score *= 1 + (Object.keys(rdata[k].words).length / 4);
    });

    var sorted_winners = Object.keys(rdata).sort((a,b) => {
        return rdata[a].score > rdata[b].score ? -1 :
               rdata[a].score < rdata[b].score ? 1 : 0;
    });

    while (sorted_winners.length > MAX_PUBS) sorted_winners.pop();

    var odata = {};
    sorted_winners.forEach((k) => {
        odata[k] = rdata[k];
    });
    return { matches: odata, keywords: words};
};

module.exports = KeyWordSearch;

