/**
 * XadillaX created at 2016-05-13 16:33:09 With ♥
 *
 * Copyright (c) 2016 Souche.com, all rights
 * reserved.
 */
"use strict";
var _util = require("config.util");

var DEFAULT_OPTIONS = {
    output: "underscore"
};

var CUOutputer = function(akyuu, options) {
    this.position = akyuu.PLUGIN_POS.BEFORE_CONNECTION;

    this.akyuu = akyuu;
    this.options = _util.extendDeep({}, DEFAULT_OPTIONS, options);
};

CUOutputer.prototype._transformKey = function(key) {
    if(typeof key !== "string") return key;

    switch(this.options.output) {
        case "underscore": return key.underscore();
        case "lower_camelize": return key.camelize(false);
        case "upper_camelize": return key.camelize(true);
        case "hyphen": return key.dasherize();
        default: return key.underscore();
    }
};

CUOutputer.prototype._transform = function(obj) {
    if(!obj || typeof obj !== "object") return obj;
    
    if(Array.isArray(obj)) {
        var res = [];
        for(var i = 0; i < obj.length; i++) {
            res.push(this._transform(obj[i]));
        }
        return res;
    }

    var res = {};
    for(var key in obj) {
        if(!obj.hasOwnProperty(key)) continue;
        res[this._transformKey(key)] = this._transform(obj[key]);
    }
    return res;
};

CUOutputer.prototype.plug = function() {
    var self = this;

    this.akyuu.use(function(req, resp, next) {
        // hack resp
        var rawSend = resp.send;
        resp.send = function() {
            if(arguments[0] && typeof arguments[0] === "object") {
                arguments[0] = self._transform(arguments[0]);
            }

            rawSend.apply(resp, arguments);
        };
        
        next();
    });
};

exports.create = function(akyuu, options) {
    return new CUOutputer(akyuu, options);
};
