/*jslint node: true, vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, navigator*/
define(function (require, exports, module) {
    "use strict";
    
    var Fn = Function,
        global = (new Fn("return this"))(),
        
        nodeWebkit = global.require("nw.gui");
    
    if (!global.nwjd) {
        global.nwjd = {};
    }
    
    // node-webkit上のnode由来のAPIをnwjd.nodeApiに公開
    if (global.root) {
        global.nwjd.nodeApi = global.root;
    }
    
    // デバッグモードで起動されたか判定
    var debugMode = nodeWebkit.App.argv.indexOf("--debug") !== -1;
    
    Object.defineProperty(global.nwjd, "debugMode", {
        get: function () { return debugMode; },
        set: function () {}
    });
    
    if (navigator.userAgent.match(/Mac OS X/)) {
        global.nwjd.platform = "mac";
    } else if (navigator.userAgent.match(/Windows/)) {
        global.nwjd.platform = "win";
    }
    
    /**
     * Node.jsモジュールを要求します。
     * @param {string} モジュール名
     */
    global.nwjd.require = global.requireNm = global.require;
    
    /**
     * Ncoのコアモジュールを取得します。
     * @param {string} module モジュール名
     */
    global.nwjd.getModule = require;
    
    module.exports = global;
});