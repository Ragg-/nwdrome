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
		this.mixer.notifyKeydown(keyState);
		this.plugin.notifyKeydown(keyState);
	};

	module.exports = Nwdrome;
});
