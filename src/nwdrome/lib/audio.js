define(function (require, exports, module) {
    var AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

    var EventEmitter2    = require("./eventemitter2/eventemitter2"),
        RingBuffer      = require("./jsdrome/ringbuffer");


    function NwdromeAudio() {
        EventEmitter2.call(this);

        var self, ctx, preGain, postGain, lpf, rbuf, scrp, al;

        this._ctx = ctx = new AudioContext();

        // Audio level buffer
        this._rbuf = rbuf = new RingBuffer(10);
        for (var i = 0; i < rbuf.length; i++) {
            rbuf.set(.5);
        }

        // sensitivity
        this._preGain = preGain = ctx.createGain();
        preGain.gain.value = .4;

        // split target band
        this._lowPass = lpf = ctx.createBiquadFilter();
        lpf.type = 0;
        lpf.frequency.value = 3000;
        lpf.Q.value = 2;

        // detector
        this._scrproc = scrp = ctx.createScriptProcessor(256);
        //scrp.onaudioprocess = function () {};

        // let output volume zero
        this._postGein = postGain = ctx.createGain();
        postGain.gain.value = 0;

        // analyzer for visualize
        this.analyzer = al = ctx.createAnalyser();
        al.fftSize = 1024;

        // input -> lpf -> preGain -> scrproc (-> postGain(0) -> destination)
        //       -> analyzer
        preGain.connect(lpf);
        lpf.connect(scrp);
        scrp.connect(postGain);
        postGain.connect(ctx.destination);
        preGain.connect(al);

        this.sensitivity = 5;
        this.meancount = 0;
        this.release = 0;


        self = this;
        navigator.webkitGetUserMedia(
            {audio : true},
            function(stream) { self.setAudioInput(stream); },
            function(e) { console.error(e); }
        );

        scrp.onaudioprocess = function (ev) {
            var inbuf0 = ev.inputBuffer.getChannelData(0);
            var inbuf1 = ev.inputBuffer.getChannelData(0);

            var buf0 = ev.outputBuffer.getChannelData(0);
            var buf1 = ev.outputBuffer.getChannelData(1);

            var sum = 0;
            for(var i = 0; i < 256; ++i) {
                if (i < 200) {
                    sum += Math.abs(inbuf0[i]) + Math.abs(inbuf1[i]);
                } else if (i === 200) {
                    sum = Math.min(sum / 50, 1.0);

                    // sum:
                    //    直近4.5ミリ秒の絶対値合計
                    //    リアルタイムの音量
                    //    200sample / 44100Hz = 0.0045sec = 4.5msec

                    self.meancount++;
                    if (self.meancount > 50) {
                        self._rbuf.set(sum);
                        self.meancount = 0;
                    }
                    var mean = self._rbuf.mean(10) * 2;
                    // mean:
                    //    直近2250ミリ秒の絶対値合計平均（4.5 * 50ミリ秒毎に10個サンプル）
                    //    パートレベルの音圧
                    self.release = Math.max(sum, self.release - 0.005);
                    var sum2 = self.release;
                    if (mean > 1.0) mean = 1.0;

                    self.emit("processed", sum2, mean);
                }

                buf0[i] = 0; //inbuf0[i];
                buf1[i] = 0; //inbuf1[i];
            }
        };

        console.info("Nwdrome audio module initialized.");
    }

    // Extend
    NwdromeAudio.prototype = Object.create(EventEmitter2.prototype);
    NwdromeAudio.prototype.constructor = EventEmitter2;

    // Properties
    NwdromeAudio.prototype.sensitivity = 5; // 20
    NwdromeAudio.prototype.meancount   = 0;
    NwdromeAudio.prototype.release     = 0;
    NwdromeAudio.prototype.analyzer    = null;


    NwdromeAudio.prototype.setAudioInput = function (stream) {
        if (this._input) {
            this._input.disconnect(this._preGain);
            this._input = null;
        }

        if (stream) {
            this._input = this._ctx.createMediaStreamSource(stream);
            this._input.connect(this._preGain);
            console.log
        }
    };

    NwdromeAudio.prototype.setSensitivity = function (value) {
        value < 0 && (value = 0);
        value > 20 && (value = 20);
        this.sensitivity = value | 0;
        this._preGain.gain.value = value / 20;
    };

    NwdromeAudio.prototype.getSensitivity = function () {
        return this.sensitivity;
    };


    return NwdromeAudio;
});
