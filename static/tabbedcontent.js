/* jshint esversion:6 */

var TabbedContent = function(config) {
    this.config = config;
    this.id_count = 0;
    this.tabs = {};
};


TabbedContent.prototype.makeID = function(suffix) {
    var sfx = suffix || this.id_count.toString();
    this.id_count += 1;
    return this.config.id_base + '_' + sfx;
};

TabbedContent.prototype.selectByName = function(name) {
    Object.keys(this.tabs).forEach((tname) => {
        var tab = this.tabs[tname].tab;
        var cont = this.tabs[tname].content;
        if (tname == name) {
            tab.classList.remove('inactive');
            tab.classList.add('active');
            cont.classList.remove('hidden');
            cont.classList.add('active');
            cont.style.display = 'block';
        } else {
            tab.classList.remove('active');
            tab.classList.add('inactive');
            cont.classList.remove('active');
            cont.classList.add('hidden');
            cont.style.display = 'none';
        }
    });
};

TabbedContent.prototype.create = function(tabscfg) {

    var target = this.target;
    if (!target) {
        target = cr('div');
        target.id = this.makeID('toptarget');
        this.target = target;
    } else {
        removeChildren(target);
    }

    var tabsdiv = cr('div','tabsdiv');
    tabsdiv.id = this.makeID('tabsdiv');
    var contentcontainer = cr('div','contentcontainer');
    contentcontainer.id = this.makeID('contentcontainer');

    var selected = null;
    tabscfg.forEach((tcfg) => {
        var tname = tcfg.name;
        if (tcfg.selected) selected = tname;
        var tabdiv = cr('div','tabdiv');
        tabdiv.id = this.makeID();
        tabdiv.innerText = tcfg.label || tname;
        tabdiv.setAttribute('tabname',tname);
        var cdiv = cr('div','contentdiv');
        cdiv.id = this.makeID();
        cdiv.appendChild(tcfg.content);
        
        tabdiv.addEventListener('click',(ev) => {
            this.selectByName(ev.target.getAttribute('tabname'));
        });
        tabsdiv.appendChild(tabdiv);
        cdiv.style.display = 'none';
        contentcontainer.appendChild(cdiv);
        this.tabs[tname] = {
            tab: tabdiv,
            content: cdiv,
        };
    });

    if (!selected) selected = Object.keys(this.tabs)[0];
    this.selectByName(selected);

    target.appendChild(tabsdiv);
    target.appendChild(contentcontainer);
    return target;
};

