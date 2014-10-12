define(function (require, exports, module) {
    var EventEmitter2 = require("./eventemitter2/eventemitter2");


    function NwdromeMixerBank() {
        this._loaded = [];
        this._active = -1;
    }

    NwdromeMixerBank.prototype = {
        getAddedPluginIds : function () {
            var ids = [];
            for (var i = 0, l = this._loaded.length; i < l; i++) {
                ids.push(this._loaded[i].instance.constructor.id);
            }

            return ids;
        },

        getSelectedIndex : function () {
            return this._active;
        },

        activePluginInstance : function () {
            return this._loaded[this._active];
        },
        addPlugin   : function (PluginConstructor) {
            var canvas = document.createElement("canvas"),
                plugin = new PluginConstructor(canvas);

            this._loaded.push({
                canvas : canvas,
                instance : plugin
            });

            return plugin;
        },
        selectPlugin    : function (num) {
            if (this._loaded[this._active]) {
                this._loaded[this._active].instance.onStop();
            }

            if (num >= 0 && num < this._loaded.length) {
                this._active = num;
                this._loaded[num].instance.onStart();
            }
        },

        render          : function () {
            var plugin = this._loaded[this._active];
            if (plugin) {
                plugin.instance.onTimer();
                return plugin.canvas;
            }
        },

        notifyMidi      : function (a1, a2, a3) {
            var plugin = this._loaded[this._active];
            plugin && plugin.instance.onMidi(a1, a2, a3);
        },
        notifyResize    : function (width, height) {
            var plugin = this._loaded[this._active];
            plugin && plugin.instance.onResize(width, height);
        },
        notifyAudio     : function (moment, period) {
            var plugin = this._loaded[this._active];
            plugin && plugin.instance.onAudio(moment, period);
        },
        notifyKeydown   : function (keyCode) {
            var plugin = this._loaded[this._active];
            plugin && plugin.instance.onKeydown(keyCode);
        }
    };




    function NwdromeMixer() {
        this._bank = [
            new NwdromeMixerBank(),
            new NwdromeMixerBank()
        ];

        this._effector = [];

        this._fade = 0; // value 0: activateBank[0]; value 1: activateBank[1]
        this._dest = document.createElement("canvas");
        this._destCtx = this._dest.getContext("2d");
    }


    NwdromeMixer.prototype = Object.create(EventEmitter2.prototype);
    NwdromeMixer.prototype.constructor = NwdromeMixer;

    NwdromeMixer.prototype.setFade         = function (fade) {
        fade > 1 && (fade = 1);
        fade < 0 && (fade = 0);
        this._fade = fade;

        this.emit("fadeChanged", fade);
    };
    NwdromeMixer.prototype.getFade         = function () {
        return this._fade;
    };

    NwdromeMixer.prototype.getDestination  = function () {
        return this._dest;
    };
    NwdromeMixer.prototype.getDeckPluginIds= function () {
        return [
            this._bank[0].getAddedPluginIds(),
            this._bank[1].getAddedPluginIds()
        ];
    };

    NwdromeMixer.prototype.getSelectedPluginIndex  = function (bank) {
        var bank = this._bank[bank];

        if (bank) {
            return bank.getSelectedIndex();
        }
    };
    NwdromeMixer.prototype.getSelectedPluginId     = function (bank) {
        var bank = this._bank[bank],
            idList;

        if (bank) {
            idList = bank.getAddedPluginIds();
            return idList[bank.getSelectedIndex()];
        }
    };

    NwdromeMixer.prototype.addPlugin       = function (bank, constructor) {
        var bank = this._bank[bank];
        bank && bank.addPlugin(constructor);
    };
    NwdromeMixer.prototype.selectPlugin    = function (bankNum, num) {
        var bank = this._bank[bankNum];
        if (bank) {
            bank.selectPlugin(num);
            bank.notifyResize(this._dest.width, this._dest.height);
        }

    };

    NwdromeMixer.prototype.addEffector     = function (Effector, order) {
        var method, instance;

        switch (order) {
            case "pre" : method = Array.prototype.unshift; break;
            case "after" :
            default :
                method = Array.prototype.push;
        }

        instance = new Effector();
        method.call(this._effector, {
            enabled : false,
            instance: instance
        });

        instance.onStart(this._dest);
    };
    NwdromeMixer.prototype.toggleEffector  = function (num, force) {
        var state;

        if (this._effector[num]) {
            if (typeof force === "boolean") {
                this._effector[num].enabled = state = force;
            }
            else {
                this._effector[num].enabled = state = !this._effector[num].enabled;
            }
        }

        return state;
    };

    NwdromeMixer.prototype.render          = function () {
        var dest    = this._dest,
            ctx     = this._destCtx,
            bank    = this._bank,
            fade    = this._fade,
            effects = this._effector,
            c1, c2, i, l;

        if (fade !== 0) {
            c1 = bank[0].render();
        }

        if (fade !== 1) {
            c2 = bank[1].render();
        }

        ctx.clearRect(0, 0, dest.width, dest.height);

        ctx.globalAlpha = 1;
        c2 != null && (ctx.globalAlpha = Math.cos((1 - fade) * 0.5 * Math.PI));
        c1 && ctx.drawImage(c1, 0, 0);

        ctx.globalAlpha = 1;
        c1 != null && (ctx.globalAlpha = Math.cos(fade * 0.5 * Math.PI));
        c2 && ctx.drawImage(c2, 0, 0);

        ctx.globalAlpha = 1;

        // Apply effectors
        for (i = 0, l = effects.length; i < l; i++) {
            effects[i].enabled && effects[i].instance.onTimer();
        }
    };

    NwdromeMixer.prototype.notifyAudio     = function (moment, period) {
        this._bank[0].notifyAudio(moment, period);
        this._bank[1].notifyAudio(moment, period);
    };
    NwdromeMixer.prototype.notifyResize    = function (width, height) {
        this._dest.width = width;
        this._dest.height = height;

        this._bank[0].notifyResize(width, height);
        this._bank[1].notifyResize(width, height);
    };
    NwdromeMixer.prototype.notifyMidi      = function (a1, a2, a3) {
        this._bank[0].notifyMidi(a1, a2, a3);
        this._bank[1].notifyMidi(a1, a2, a3);
    };

    NwdromeMixer.prototype.notifyKeydown   = function (keyState) {
        //keyState.keyCode;
        this._bank[0].notifyKeydown(keyState.keyCode);
        this._bank[1].notifyKeydown(keyState.keyCode);
    };

    return NwdromeMixer;
});
