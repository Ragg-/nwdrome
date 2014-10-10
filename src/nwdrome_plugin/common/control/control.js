// Control Window plugin

// This program is licensed under the MIT License.
// Copyright 2014, aike (@aike1000)
// Port to nwdrome by Ragg(@_ragg_)
nwdrome.plugin.addCommon(function(config) {
    function noop() {}

    var MiniWindow = function(app) {
        this.app = nwdrome;

        this.id = "jsdrome-miniwindow";
        this.key = [['1','2','3','4','5','6','7','8','9','0'],
                    ['Q','W','E','R','T','Y','U','I','O','P']];

        this.descA = this.drawDescArea(this.id + '_textA');
        this.descB = this.drawDescArea(this.id + '_textB');

        this.descA.css({opacity: 1});
        this.descB.css({opacity: 0});

        this.root = $('<div>')
            .attr({id: this.id})
            .css({
                position: 'absolute',
                top     : 10,
                left    : 0,
                right   : 0
            })
            .appendTo('#nwdrome_container')

        this.descCommon = $('<div>')
            .attr({ id: this.id + '_com' })
            .css({
                position: 'absolute',
                top: 500,
                left: 100,
                color: '#fff',
                fontSize: 12
            })
            .appendTo(this.root);

        this.cursor = new Array(2);
        this.thumbWidth = 70 + 10 * 80 + 9 * 10 + 20;
        this.thumb = this.drawThumbArea(this.id + '_thmb');

        var self = this;
        setTimeout(function() { self.drawThumb(); }, 1000);
        setTimeout(function() { self.drawCommonDesc(); }, 2000);

        nwdrome.mixer.on("fadeChanged", function (fade) {
            self.onFade(fade);
        });
    }

    MiniWindow.id = 'jsdrome.miniwindow';
    MiniWindow.description =
        "MiniWindow\n"
        + "  Make drawing area smaller common plugin\n"
        + "  Audio insensitive\n"
        + "  [return] full screen on/off\n";

    MiniWindow.prototype.drawThumbArea = function(id) {
        var elem = $('<div>')
        .attr({ id: id })
        .css({
            // position: 'absolute',
            // top: 10,
            // left: 100,
            position: 'relative',
            margin: '0 auto',
            width: this.thumbWidth,
            height: 150,
            backgroundColor: '#111130'
        }).appendTo(this.root);

        this.cursor[0] = $('<div>')
        .css({
            position: 'absolute',
            left: 70 + 0 * 90 - 1,
            top: 25 + 0 * 55 - 1,
            width: 80,
            height: 45,
            border: 'solid 1px #ddddee',
            boxShadow: '0 0 5px 5px rgba(127,127,255,0.5)',
            zIndex: 5
        }).appendTo(elem);

        this.cursor[1] = $('<div>')
        .css({
            position: 'absolute',
            left: 70 + 0 * 90 - 1,
            top: 25 + 1 * 55 - 1,
            width: 80,
            height: 45,
            border: 'solid 1px #ddddee',
            boxShadow: '0 0 5px 5px rgba(127,127,255,0.5)',
            zIndex: 5
        }).appendTo(elem);

        var self = this;
        this.xfader = $('<input>')
        .attr({
            type: 'range',
            min: 0,
            max: 100,
            step: 1,
            value: 100
        })
        .css({
            position: 'absolute',
            top: 60,
            left: -20,
            width: 90,
            height: 20,
            transform: 'rotate(-90deg)'
        })
        .on('input', function(){
            self.app.mixer.setFade(this.value / 100);
            //self.app.setFade(self.app.fade);
        })
        .appendTo(elem);


        return elem;
    }

    MiniWindow.prototype.drawThumb = function() {
        var divid = '#' + this.id + '_thmb',
            decks = this.app.mixer.getDeckPluginIds(),
            self  = this;

        for (var i = 0; i < decks.length; i++) {
            var pluginIds   = decks[i],
                jmax        = Math.min(10, pluginIds.length);

            for (var j = 0; j < jmax; j++) {
                var imagefile   = config.url + 'noimage.png',
                    pluginInfo  = this.app.plugin.getPluginInfo(pluginIds[j]);

                if (pluginInfo.thumbnail) {
                    imagefile = pluginInfo.thumbnail;
                }


                $('<img>')
                    .attr({
                        src: imagefile,
                        ch: i,
                        pos: j
                    })
                    .css({
                        position: 'absolute',
                        left: 70 + j * 90,
                        top: 25 + i * 55,
                        width: 80,
                        height: 45,
                        backgroundColor: '#222288',
                        cursor: 'pointer',
                        zIndex: 10
                    })
                    .click(function() {
                        var bank = parseInt($(this).attr('ch'), 10);
                        var pos = parseInt($(this).attr('pos'), 10);

                        self.setCursor(bank, pos, self.app.mixer.getFade());
                        self.app.mixer.selectPlugin(bank, pos);
                        self.showDescription();
                    })
                    .appendTo(divid);
            }
        }

        for (var i = 0; i < decks.length; i++) {
            for (var j = 0; j < this.key[i].length; j++) {
                $('<div>')
                .css({
                    position: 'absolute',
                    top: 8 + i * 124,
                    left: 110 + j * 90,
                    color: '#bbbbbb',
                    fontSize: 9
                })
                .text(this.key[i][j])
                .appendTo(divid);
            }
        }

        var selected;

        selected = this.app.mixer.getSelectedPluginIndex(0);
        selected = selected === -1 ? 0 : selected;
        this.setCursor(0, selected, this.app.mixer.getFade());

        selected = this.app.mixer.getSelectedPluginIndex(1);
        selected = selected === -1 ? 0 : selected;
        this.setCursor(1, selected, this.app.mixer.getFade());
    }

    MiniWindow.prototype.setCursor = function(ch, pos, opa) {
        var alpha;

        pos = pos < 0 ? 0 : pos;

        if (ch === 0) {
            alpha = opa.toFixed(1);
        } else {
            alpha = (1.0 - opa).toFixed(1);
        }

        this.cursor[ch]
            .css({
                left: 70 + pos * 90 - 1,
                boxShadow: '0 0 5px 5px rgba(127,127,255,' + alpha + ')'
            });
    }


    MiniWindow.prototype.drawDescArea = function(id) {
        var div = $('<div>')
        .attr({ id: id })
        .css({
            position: 'absolute',
            top: 150,
            left: 100,
            width: 400
        }).appendTo(this.root);

        $('<div>')
        .attr({ id: id + '1'})
        .css({
            position: 'absolute',
            top: 0,
            left: 0,
            color: '#fff',
            fontSize: 16
        }).appendTo(div);

        $('<div>')
        .attr({ id: id + '2'})
        .css({
            position: 'absolute',
            top: 50,
            left: 0,
            color: '#fff',
            fontSize: 16
        }).appendTo(div);

        return div;
    }

    MiniWindow.prototype.drawCommonDesc = function() {
        var desc = '[A][Z] cross fade<br>'
                 + '[S][X] audio sensitivity<br>';

        var p = this.app.plugin.getPluginInfoList("common");

        for (var i in p) {
            if (p[i].description) {
                var s = p[i].description.match(/^ *\[.*$/m);
                if (s) {
                    desc += s + '<br>';
                }
            }
        }

        $('#' + this.id + '_com').html(desc);
    }

    MiniWindow.prototype.showDescriptionSub = function(isA) {
        var n, pluginId, s, elem, info;
        if (isA) {
            n = 0;
            pluginId = this.app.mixer.getSelectedPluginId(0);
            s = this.key[0][pluginId];
            elem = this.descA;
        } else {
            n = 1;
            pluginId = this.app.mixer.getSelectedPluginId(1);
            s = this.key[1][pluginId];
            elem = this.descB;
        }
        if (! (info = this.app.plugin.getPluginInfo(pluginId)))
            return;
        var text = info.description;
        var re = text.match(/(.*)/g);
        var title = re[0];
        var body = text.substring(title.length + 1);
        elem.children(':first')
        .text('[' + s + '] ' + title)
        .next()
        .html(body.replace(/\n/g, '<br>'));
    }

    MiniWindow.prototype.showDescription = function() {
        this.showDescriptionSub(true);
        this.showDescriptionSub(false);
    }

    ////////////////////////
    MiniWindow.prototype.onStart    = noop;

    MiniWindow.prototype.onStop     = noop;

    MiniWindow.prototype.onFade = function(opa) {
        this.descA.css({opacity: opa});
        this.descB.css({opacity: 1.0 - opa});

        this.setCursor(0, this.app.mixer.getSelectedPluginIndex(0), opa);
        this.setCursor(1, this.app.mixer.getSelectedPluginIndex(1), opa);
    }

    MiniWindow.prototype.onAudio    = noop;

    MiniWindow.prototype.onKeydown = function(keyState) {
        switch (keyState.keyCode) {

        case 65: // A
        case 90: // Z
            this.xfader.val(Math.floor(this.app.fade * 100));
            break;

        case 13:		// return
            this.enable = !this.enable;
            if (this.enable) {
                this.descCommon
                .css({ display: 'block' });
                this.descA
                .css({ display: 'block' });
                this.descB
                .css({ display: 'block' });
                this.thumb
                .css({ display: 'block' });
                // app.onResize();
            } else {
                this.descCommon
                .css({ display: 'none' });
                this.descA
                .css({ display: 'none' });
                this.descB
                .css({ display: 'none' });
                this.thumb
                .css({ display: 'none' });
                // app.onResize();
            }
            break;

        // プラグイン切り替え
        case 49: // 1
        case 50: // 2
        case 51: // 3
        case 52: // 4
        case 53: // 5
        case 54: // 6
        case 55: // 7
        case 56: // 8
        case 57: // 9
        case 48: // 0
            this.showDescription();
            this.setCursor(
                0,
                this.app.mixer.getSelectedPluginIndex(0),
                this.app.mixer.getFade());
            break;

        case 81: // Q
        case 87: // W
        case 69: // E
        case 82: // R
        case 84: // T
        case 89: // Y
        case 85: // U
        case 73: // I
        case 79: // O
        case 80: // P
            this.showDescription();
            this.setCursor(
                1,
                this.app.mixer.getSelectedPluginIndex(1),
                this.app.mixer.getFade());
            break;
        }
    }

    MiniWindow.prototype.onResize = function(x, y, width, height) {
        if (this.enable) {
            // app.draww = Math.floor(width / 2 - 100);
            // app.drawh = Math.floor(app.draww * 9 / 16);
            // app.drawx = Math.floor(width / 2 + 50);
            // app.drawy = 200;
        }

        // var y = app.drawy;
        // this.descA.css({top: y});
        // this.descB.css({top: y});
        //
        // this.thumb.css({ left: (width - this.thumbWidth) / 2})
    }

    MiniWindow.prototype.onTimer = noop;

    MiniWindow.prototype.onMidi = function(a1, a2, a3) {
        switch (a1) {
            case 0x90:	// Note On
                switch (a2) {
                    case 36:
                    case 37:
                    case 40:
                    case 41:
                    case 44:
                    case 45:
                    case 48:
                    case 49:
                        this.showDescription();
                        this.setCursor(0, this.app.selPluginA, this.app.fade);
                        break;

                    case 38:
                    case 39:
                    case 42:
                    case 43:
                    case 46:
                    case 47:
                    case 50:
                    case 51:
                        this.showDescription();
                        this.setCursor(1, this.app.selPluginB, this.app.fade);
                        break;
                }

            case 0xB0:	// CC#
                switch (a2) {
                    case 1:
                        this.xfader.val(Math.floor(this.app.fade * 100));
                        break;
                }
                break;
        }
    }

////////////////////////

    //app && app.addCommonPlugin(new MiniWindow(app));
    return MiniWindow;
});
