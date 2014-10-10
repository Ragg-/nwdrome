nwdrome.plugin.addRenderer(function(config) {
    function noop() {}

    function nwdmSpectrum(canvas) {
        this._canvas = canvas;
        this._ctx = this._canvas.getContext("2d");
    }

    nwdmSpectrum.id = "nwdrome.spectrum";
    nwdmSpectrum.thumbnail = "";
    nwdmSpectrum.description = "Audio spectrum Plugin";

    nwdmSpectrum.prototype.onStart = noop;
    nwdmSpectrum.prototype.onStop = noop;
    nwdmSpectrum.prototype.onFade = noop;
    nwdmSpectrum.prototype.onAudio = noop;
    nwdmSpectrum.prototype.onKeydown = noop;
    nwdmSpectrum.prototype.onMidi = noop;

    nwdmSpectrum.prototype.onResize = function (w, h) {
        this._canvas.width = w;
        this._canvas.height = h;
    };

    nwdmSpectrum.prototype.onTimer = function() {
        var baseLine, pointInterval, maxWaveHeight, samples, i, l, y;
        var c = this._canvas;
            c_ctx = this._ctx;
            an = nwdrome.audio.analyzer;

        samples = new Uint8Array(an.fftSize);
        an.getByteTimeDomainData(samples);

        baseLine = c.height / 2;
        maxWaveHeight = c.height / 2;
        pointInterval = c.width / (samples.length - 1);

        c_ctx.strokeStyle = "rgba(255, 0, 0, .4)";
        c_ctx.fillStyle = c_ctx.strokeStyle = "rgba(54, 244, 214, 0.4)";

        c_ctx.clearRect(0, 0, c.width, c.height);
        c_ctx.beginPath();
        for (i = 0, l = samples.length; i < l; i++) {
            c_ctx.lineTo(pointInterval * i, baseLine - (maxWaveHeight * (samples[i] / 255)));
        }
        c_ctx.stroke();

        c_ctx.beginPath();
        for (i = samples.length - 1; i >= 0; i--) {
            y = maxWaveHeight * samples[i] / 255;
            c_ctx.lineTo(pointInterval * i, baseLine + y);
        }
        c_ctx.stroke();
    };

    return nwdmSpectrum;
});
