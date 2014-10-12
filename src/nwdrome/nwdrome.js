/**
 * Nwdrome
 *
 * This software is released under the MIT License.
 * Copyright 2014, Ragg(@_ragg_)
 *
 * Nwdrome based on JSdrome.
 */
/*
 *
 * JSdrome - plugable javascript VJ platform
 *
 * This program is licensed under the MIT License.
 * Copyright 2014, aike (@aike1000)
 *
 */
define(function (require, exports, module) {
	var NwdromePlugin 	= require("./lib/plugin"),
		NwdromeAudio 	= require("./lib/audio"),
		NwdromeMixer	= require("./lib/mixer"),
		EventEmitter2 	= require("./lib/eventemitter2/eventemitter2");

	function Nwdrome() {
		this.plugin = new NwdromePlugin();
		this.audio 	= new NwdromeAudio();
		this.mixer 	= new NwdromeMixer();
        this.lib    = {
            EventEmitter2 : EventEmitter2,
            RingBuffer    : require("./lib/jsdrome/ringbuffer")
        };

		var self = this;

		this.plugin.on("pluginAdded", function (info) {
			console.info(
				"%cnwdrome plugin: add %s (%s)",
				"background-color:#0be; color:#fff",
				info.type,
				info.id);
		});

		this.plugin.on("pluginAdded", function (info) {
			if (info.type !== "renderer") {
				return;
			}

			var Plugin = self.plugin.getRenderer(info.id);

			self.mixer.addPlugin(0, Plugin);
			self.mixer.addPlugin(1, Plugin);
		});

        this.audio.on("processed", function (moment, mean) {
            self.mixer.notifyAudio(moment, mean);
            self.plugin.notifyAudio(moment, mean);
        });
	}

	Nwdrome.prototype = Object.create(EventEmitter2.prototype);
	Nwdrome.prototype.constructor = Nwdrome;

	Nwdrome.prototype.notifyResize    = function (width, height) {
        this.emit("resize", width, height);
		this.mixer.notifyResize(width, height);
		this.plugin.notifyResize(width, height);
	};

	Nwdrome.prototype.notifyMidi      = function (a1, a2, a3) {
        this.emit("midiInput", a1, a2, a3);
		this.mixer.notifyMidi(a1, a2, a3);
		this.plugin.notifyMidi(a1, a2, a3);
	};

	Nwdrome.prototype.notifyKeydown   = function (keyState) {
        if (keyState instanceof KeyboardEvent) {
            keyState = {
                keyCode : keyState.keyCode,
                shift   : keyState.shiftKey,
                alt     : keyState.altKey,

                // if in MacOSX use e.metaKey instead of e.ctrlKey
                // ignore metaKey on windows
                ctrl    : navigator.platform === "MacIntel" ? keyState.metaKey : keyState.ctrlKey
            };
        }

        this.emit("keydown", keyState);

        if (keyState.shift || keyState.alt || keyState.ctrl) {
            this.mixer.notifyKeydown(keyState);
            this.plugin.notifyKeydown(keyState);
            return;
        }

        //-- Key bindings in below
        // First level key hook
        var keyCode = keyState.keyCode,
            pos;

        if ((pos = [49, 50, 51, 52, 53, 54, 55, 56, 57, 48].indexOf(keyCode)) !== -1) {
            // 123...90 keys
            this.mixer.selectPlugin(0, pos);
        }
        else if ((pos = [81, 87, 69, 82, 84, 89, 85, 73, 79, 80].indexOf(keyCode)) !== -1) {
            // QWE...OP keys
            this.mixer.selectPlugin(1, pos);
        }

        switch (keyCode) {
            case 65:
                // A key
                this.mixer.setFade(this.mixer.getFade() + 0.05);
                break;

            case 90:
                // Z key
                this.mixer.setFade(this.mixer.getFade() - 0.05);
                break;

            case 83:
                // S key
                var value = this.audio.getSensitivity();
                this.audio.setSensitivity(++value);
                break;

            case 88:
                // X key
                var value = this.audio.getSensitivity();
                this.audio.setSensitivity(--value);
                break;
        }
	};

	module.exports = Nwdrome;
});
