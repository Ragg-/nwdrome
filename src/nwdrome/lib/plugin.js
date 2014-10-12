define(function (require, exports, module) {
    var EventEmitter2 = require("./eventemitter2/eventemitter2");

    function _getCallerFilePath(stackDeep) {
        stackDeep = stackDeep == null ? 0 : stackDeep;

        var stack = new Error().stack.split(/\r|\n|\r\n/),
            calledOn  = stack && stack[2] && stack[2 + stackDeep].match(/\((.+)\)/),
            file = calledOn && calledOn[1] && calledOn[1].match(/(.+):\d+:\d+$/);

        if (file && file[1]) {
            return file[1]
        }
    }

    function _createPluginConfig() {
        var appPath = location.href.toString(),
            appDir = appPath.substr(0, appPath.lastIndexOf("/") + 1),

            pluginPath = _getCallerFilePath(2),
            pluginDir = pluginPath.substr(0, pluginPath.lastIndexOf("/") + 1),
            relative = pluginDir.indexOf(appDir) !== -1 ? pluginDir.substr(appDir.length) : pluginDir;

        return {
            appUrl: appDir,
            url : relative
        };
    }


    function NwdromePlugin() {
        EventEmitter2.call(this);

        this._pluginStock = {};
        this._pluginInfoCache = {};

        this._activatedCommons = {};

        console.warn("Notice: Common plugin's #onAudio method is deplecated.");
    }

    NwdromePlugin.COMMON_BEFORE_FILTER  = "before";
    NwdromePlugin.COMMON_AFTER_FILTER   = "after";

    NwdromePlugin.prototype = Object.create(EventEmitter2.prototype);
    NwdromePlugin.prototype.constructor = NwdromePlugin;


    NwdromePlugin.prototype.getPluginInfoList = function (type) {
        var filteredItems,
            infoCache = this._pluginInfoCache;

        if (typeof type === "string") {
            filteredItems = {};

            for (var id in infoCache) {
                if (infoCache[id].type == type) {
                    filteredItems[id] = infoCache[id];
                }
            }
        }
        else {
            filteredItems = infoCache;
        }

        return JSON.parse(JSON.stringify(filteredItems));
    };


    NwdromePlugin.prototype.getPluginInfo = function (pluginId) {
        var config = JSON.stringify(this._pluginInfoCache[pluginId]);
        if (config) {
            return JSON.parse(config);
        }
    };


    NwdromePlugin.prototype._addPlugin = function (pluginObj) {
        var id = pluginObj.plugin.id;

        if (this._pluginStock[id]) {
            console.error("Plugin id conflicted (or plugin already loaded) : %s", id);
            return;
        }

        this._pluginStock[id] = pluginObj;
        this._pluginInfoCache[id] = {
            id          : id,
            type        : pluginObj.type,
            description : pluginObj.plugin.description,
            thumbnail   : pluginObj.plugin.thumbnail
        };

        this.emit("pluginAdded", this._pluginInfoCache[id]);
    };

    NwdromePlugin.prototype.addRenderer     = function (factory) {
        var config = _createPluginConfig(),
            plugin = factory(config);

    	this._addPlugin({
            type    : "renderer",
            plugin  : plugin,
            config  : config
        });

        return plugin;
    };

    NwdromePlugin.prototype.addCommon = function (factory) {
        var config = _createPluginConfig(),
            plugin = factory(config);

        this._addPlugin({
            type    : "common",
            plugin  : plugin,
            config  : config
        });

        if (! this._activatedCommons[plugin.id]) {
            this._activatedCommons[plugin.id] = new plugin();
            this.emit("commonPluginEnabled", this._activatedCommons[plugin.id]);
        }

        return plugin;
    };

    NwdromePlugin.prototype.addEffector = function (factory) {
        var config = _createPluginConfig(),
            plugin = factory(config);

        this._addPlugin({
            type    : "effector",
            plugin  : plugin,
            config  : config
        });

        return plugin;
    };


    NwdromePlugin.prototype._getPlugin = function (type, id) {
        var plugin = this._pluginStock[id];

        if (! plugin) {
            console.error("Plugin (id: %s) not loaded.", id);
            return;
        }

        if (plugin.type === type) {
            return plugin.plugin
        }
    };

    NwdromePlugin.prototype.getRenderer = function (pluginId) {
        return this._getPlugin("renderer", pluginId);
    };

    NwdromePlugin.prototype.getCommon = function (pluginId) {
        return this._getPlugin("common", pluginId);
    };

    NwdromePlugin.prototype.getEffector = function (pluginId) {
        return this._getPlugin("effector", pluginId);
    };


    NwdromePlugin.prototype.notifyAudio     = function (moment, period) {
        for (var i in this._activatedCommons) {
            this._activatedCommons[i].onResize(moment, period);
        }
    };


    NwdromePlugin.prototype.notifyResize    = function (width, height) {
        for (var i in this._activatedCommons) {
            this._activatedCommons[i].onResize(width, height);
        }
    };

    NwdromePlugin.prototype.notifyMidi      = function (a1, a2, a3) {
        for (var i in this._activatedCommons) {
            this._activatedCommons[i].onMidi(a1, a2, a3);
        }
    };

    NwdromePlugin.prototype.notifyKeydown   = function (keyState) {
        for (var i in this._activatedCommons) {
            this._activatedCommons[i].onKeydown(keyState);
        }
    };

    return NwdromePlugin;
});
