Ext.ns("Compass.ErpApp.Utility");

//handle session timeout
Compass.ErpApp.Utility.SessionTimeout = {
    enabled: false,
    redirectTo: null,
    warnInMilliseconds: null,
    warnTimer: null,
    redirectInMilliseconds: null,
    redirectTimer: null,

    setForceRedirectTimer: function (action) {
        switch (action) {
            case 'start':
                var self = this;
                this.redirectTimer = window.setTimeout(function () {
                    window.location = self.redirectTo;
                }, this.redirectInMilliseconds);
                break;
            case 'stop':
                clearTimeout(this.redirectTimer);
                break;
        }
    },
    setWarnTimer: function (action) {
        switch (action) {
            case 'start':
                var self = this;
                this.warnTimer = window.setTimeout(function () {
                    Ext.MessageBox.confirm('Confirm', 'Your session is about to expire due to inactivity. Do you wish to continue this session?', function (btn) {
                        if (btn == 'no') {
                            window.location = self.redirectTo;
                        }
                        else if (btn == 'yes') {
                            Ext.Ajax.request({
                                method: 'POST',
                                url: '/session/keep_alive',
                                success: function (result, request) {
                                    self.reset();
                                }
                            });
                        }
                    });
                }, this.warnInMilliseconds);
                break;
            case 'stop':
                clearTimeout(this.warnTimer);
                break;
        }
    },
    setupSessionTimeout: function (warnInMilliseconds, redirectInMilliseconds, redirectTo) {
        var self = this;
        Ext.Ajax.addListener('requestcomplete', this.reset, this);

        this.enabled = true;
        this.redirectTo = redirectTo;
        this.warnInMilliseconds = warnInMilliseconds;
        this.redirectInMilliseconds = redirectInMilliseconds;

        this.setForceRedirectTimer('start');
        this.setWarnTimer('start');
    },
    reset: function () {
        this.setWarnTimer('stop');
        this.setForceRedirectTimer('stop');

        this.setWarnTimer('start');
        this.setForceRedirectTimer('start');
    }
};
//end handle session timeout

Compass.ErpApp.Utility.confirmBrowserNavigation = function (additionalmessage) {
    additionalmessage = additionalmessage || null;
    window.onbeforeunload = function () {
        return Ext.isEmpty(additionalmessage) ? '' : additionalmessage;
    }
};

Compass.ErpApp.Utility.disableEnterSubmission = function () {
    $(function () {
        $("form").bind("keypress", function (e) {
            if (e.keyCode == 13) return false;
        });
    });
};

Compass.ErpApp.Utility.evaluateScriptTags = function (element) {
    var scriptTags = element.getElementsByTagName("script");
    for (var i = 0; i < scriptTags.length; i++) {
        eval(scriptTags[i].text);
    }
};

Compass.ErpApp.Utility.promptReload = function () {
    Ext.MessageBox.confirm('Confirm', 'Page must reload for changes to take affect. Reload now?', function (btn) {
        if (btn == 'no') {
            return false;
        }
        else {
            window.location.reload();
        }
    });
};

Compass.ErpApp.Utility.handleFormFailure = function (action) {
    switch (action.failureType) {
        case Ext.form.action.Action.CLIENT_INVALID:
            Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
            break;
        case Ext.form.action.Action.CONNECT_FAILURE:
            Ext.Msg.alert('Failure', 'Ajax communication failed');
            break;
        case Ext.form.action.Action.SERVER_INVALID:
            Ext.Msg.alert('Failure', action.result.msg);
    }
};

Compass.ErpApp.Utility.randomString = function (length) {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var randomString = '';
    for (var i = 0; i < length; i++) {
        var randomNumber = Math.floor(Math.random() * chars.length);
        randomString += chars.substring(randomNumber, randomNumber + 1);
    }
    return randomString
};

Compass.ErpApp.Utility.roundNumber = function (num) {
    var twoDPString = "0.00";
    if (!Compass.ErpApp.Utility.isBlank(num) && !isNaN(num)) {
        var dnum = Math.round(num * 100) / 100;
        twoDPString = dnum + "";
        if (twoDPString.indexOf(".") == -1) {
            twoDPString += ".00"
        }
        if (twoDPString.indexOf(".") == twoDPString.length - 2) {
            twoDPString += "0"
        }

    }
    return twoDPString;
};

Compass.ErpApp.Utility.numbersOnly = function (e, decimal) {
    var key;
    var keychar;

    if (window.event) {
        key = window.event.keyCode;
    }
    else if (e) {
        key = e.which;
    }
    else {
        return true;
    }
    keychar = String.fromCharCode(key);

    if ((key == null) || (key == 0) || (key == 8) || (key == 9) || (key == 13) || (key == 27)) {
        return true;
    }
    else if ((("0123456789").indexOf(keychar) > -1)) {
        return true;
    }
    else if (decimal && (keychar == ".")) {
        return true;
    }
    else
        return false;
};

//FIXME: This is broken; missing the Ext.ux.util.clone file
Compass.ErpApp.Utility.clone = function (o) {
    if (!o || 'object' !== typeof o) {
        return o;
    }
    if ('function' === typeof o.clone) {
        return o.clone();
    }
    var c = '[object Array]' === Object.prototype.toString.call(o) ? [] : {};
    var p, v;
    for (p in o) {
        if (o.hasOwnProperty(p)) {
            v = o[p];
            if (v && 'object' === typeof v) {
                c[p] = Ext.ux.util.clone(v);
            }
            else {
                c[p] = v;
            }
        }
    }
    return c;
};

Compass.ErpApp.Utility.addCommas = function (nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
};

Compass.ErpApp.Utility.isBlank = function (value) {
    return Ext.isEmpty(value);
};

Compass.ErpApp.Utility.removeDublicates = function (arrayName) {
    var newArray = new Array();
    label:for (var i = 0; i < arrayName.length; i++) {
        for (var j = 0; j < newArray.length; j++) {
            if (newArray[j].unit_id == arrayName[i].unit_id)
                continue label;
        }
        newArray[newArray.length] = arrayName[i];
    }
    return newArray;
};

Compass.ErpApp.Utility.isArray = function (o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

Compass.ErpApp.Utility.wait = function (ms) {
    ms += new Date().getTime();
    while (new Date() < ms) {
    }
};

Compass.ErpApp.Utility.limitTextArea = function (textArea, limit) {
    var value = textArea.value;
    if (value.length > limit) {
        textArea.value = value.substring(0, limit);
    }
    return true;
};

Compass.ErpApp.Utility.formatCurrency = function (num) {
    num = num.toString().replace(/\$|\,/g, '');
    if (isNaN(num))
        num = "0";
    var sign = (num == (num = Math.abs(num)));
    num = Math.floor(num * 100 + 0.50000000001);
    var cents = num % 100;
    num = Math.floor(num / 100).toString();
    if (cents < 10)
        cents = "0" + cents;
    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
        num = num.substring(0, num.length - (4 * i + 3)) + ',' +
            num.substring(num.length - (4 * i + 3));
    return (((sign) ? '' : '-') + '$' + num + '.' + cents);
};

Compass.ErpApp.Utility.addEventHandler = function(obj, evt, handler) {
    if(obj.addEventListener) {
        // W3C method
        obj.addEventListener(evt, handler, false);
    } else if(obj.attachEvent) {
        // IE method.
        obj.attachEvent('on'+evt, handler);
    } else {
        // Old school method.
        obj['on'+evt] = handler;
    }
};

function OnDemandLoadByAjax(){
    this.load = function (components, callback) {
        this.components = components;
        this.successCallBack = callback;
        this.attempts = 0;
        this.scriptsToLoad = [];

        if (!Compass.ErpApp.Utility.isArray(this.components)) {
            this.components = [this.components];
        }

        for (var i = 0; i < this.components.length; i++) {
            this.scriptsToLoad.push({
                url: this.components[i],
                status: 'pending'
            });
        }

        for (var t = 0; t < this.scriptsToLoad.length; t++) {
            this.loadScript(this.scriptsToLoad[t]);
        }
    };

    this.allScriptsDone = function () {
        for (var i = 0; i < this.scriptsToLoad.length; i++) {
            if (this.scriptsToLoad[i].status == 'pending')
                return false;
        }
        return true;
    };

    this.scriptDone = function () {
        if (this.allScriptsDone()) {
            this.onSuccess();
        }
    };

    this.loadScript = function (scriptToLoad) {
        var self = this;
        var ss = document.getElementsByTagName("script");
        for (i = 0; i < ss.length; i++) {
            if (ss[i].src && ss[i].src.indexOf(scriptToLoad.url) != -1) {
                scriptToLoad.status = 'success';
                self.scriptDone();
                return;
            }
        }
        var s = document.createElement("script");
        s.type = "text/javascript";
        s.src = scriptToLoad.url;
        var head = document.getElementsByTagName("head")[0];
        head.appendChild(s);
        s.onload = s.onreadystatechange = function () {
            if (this.readyState && this.readyState == "loading")
                return;
            scriptToLoad.status = 'success';
            self.scriptDone();
        }
        s.onerror = function () {
            head.removeChild(s);
            scriptToLoad.status = 'failure';
            self.scriptDone();
        }
    };

    this.onSuccess = function () {
        if (!Ext.isEmpty(this.successCallBack) && this.successCallBack) {
            this.successCallBack();
        }
    };

    this.onFailure = function () {
    };
};

//Javascript Extensions

//Array Extensions
Array.prototype.contains = function (element) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == element) {
            return true;
        }
    }
    return false;
};

Array.prototype.find = function (find_statement) {
    try {
        for (var i = 0; i < this.length; i++) {
            var statement = "this[i]." + find_statement;
            if (eval(statement)) {
                return this[i];
            }
        }
    }
    catch (ex) {
        return null;
    }
    return null;
};

Array.prototype.select = function (find_statement) {
    var sub_array = [];
    try {
        for (var i = 0; i < this.length; i++) {
            var statement = "this[i]." + find_statement;
            if (eval(statement)) {
                sub_array.push(this[i]);
            }
        }
    }
    catch (ex) {
        return null;
    }
    return sub_array;
};

Array.prototype.first = function () {
    if (this[0] == undefined) {
        return null;
    }
    else {
        return this[0];
    }
};

Array.prototype.last = function () {
    if (this[this.length - 1] == undefined) {
        return null;
    }
    else {
        return this[this.length - 1];
    }
};

Array.prototype.collect = function (item) {
    var items = [];
    try {
        for (var i = 0; i < this.length; i++) {
            items.push(this[i][item]);
        }
    }
    catch (ex) {
        return null;
    }
    return items;
};

Array.prototype.empty = function () {
    return (this.length == 0);
};

//String Extensions

String.prototype.underscore = function () {
    return this.replace(/\s/g, "_");
};

String.prototype.downcase = function () {
    return this.toLowerCase();
};

String.prototype.upcase = function () {
    return this.toUpperCase();
};

String.prototype.camelize = function () {
    var parts = this.replace(/_/, '-').split('-'), len = parts.length;
    if (len == 1) return parts[0];

    var camelized = this.charAt(0) == '-'
        ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1)
        : parts[0];

    for (var i = 1; i < len; i++)
        camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);

    return camelized;
};

String.prototype.titleize = function () {
    var parts = this.replace(/_/, '-').split('-'), len = parts.length, titleized = '';
    for (var i = 0; i < len; i++) {
        if (i > 0) titleized += ' ';
        titleized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
    }
    return titleized;
};

//Function Extensions

Function.prototype.bindToEventHandler = function bindToEventHandler() {
  var handler = this;
  var boundParameters = Array.prototype.slice.call(arguments);
  //create closure
  return function(e) {
      e = e || window.event; // get window.event if e argument missing (in IE)   
      boundParameters.unshift(e);
      handler.apply(this, boundParameters);
  }
};

