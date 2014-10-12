// Control Window plugin

// This program is licensed under the MIT License.
// Copyright 2014, aike (@aike1000)
// Port to nwdrome and modified by Ragg (@_ragg_)
nwdrome.plugin.addCommon(function(config) {
    var nwdrome = window.nwdrome;

    function noop() {}

    var MiniWindow = function(app) {
        this.id = "jsdrome-miniwindow";
        this.key = [['1','2','3','4','5','6','7','8','9','0'],
                    ['Q','W','E','R','T','Y','U','I','O','P']];

        this.$root = $('<div>')
            .attr({id: this.id})
            .css({
                position: 'absolute',
                top     : 10,
                left    : 0,
                right   : 0
            })
            .appendTo('#nwdrome_container');

        this.descA = this.createDescArea(this.id + '_textA');
        this.descB = this.createDescArea(this.id + '_textB');

        this.descA
            .css({
                top: 160,
                left: 100,
                opacity: 1
            })
            .appendTo(this.$root);

        this.descB
            .css({
                top: 160,
                left: 300 + 100 + 32,
                opacity: 1
            })
            .appendTo(this.$root);


        this.descCommon = $('<div>')
            .attr("id", this.id + '_com')
            .css({
                position: 'absolute',
                top: 500,
                left: 100,
                color: '#fff',
                fontSize: 12
            })
            .appendTo(this.$root);


        this.cursor = new Array(2);
        this.thumbWidth = 70 + 10 * 80 + 9 * 10 + 20;
        this.thumb = this.initThumbArea(this.id + '_thmb');

        var self = this;
        setTimeout(function() { self.initPluginThumb(); }, 1000);
        setTimeout(function() { self.drawCommonDesc(); }, 2000);

        nwdrome.mixer.on("fadeChanged", function (fade) {
            self.onFade(fade);
        });
        nwdrome.mixer.on("selectionChanged", function (selection) {
            self.setCursor(selection.bank);
            //self.showPluginDescription(selection.bank === 0);
            self.showAllDescription();
        });
        this.onFade(nwdrome.mixer.getFade());
    };

    MiniWindow.id = 'jsdrome.miniwindow';
    MiniWindow.description =
        "MiniWindow\n"
        + "  Make drawing area smaller common plugin\n"
        + "  Audio insensitive\n"
        + "  [return] control window on/off\n";

    // Initialize thumbnails & fader container
    MiniWindow.prototype.initThumbArea = function(id) {

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
            }).appendTo(this.$root);

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
                nwdrome.mixer.setFade(this.value / 100);
            })
            .appendTo(elem);

        return elem;
    };

    // Draw plugin thumbnails
    MiniWindow.prototype.initPluginThumb = function() {
        var divId = '#' + this.id + '_thmb',
            decks = nwdrome.mixer.getDeckPluginIds(),
            self  = this,
            i, j, l;

        function thumbClicked() {
            var bank = $(this).attr('deck') | 0;
            var pos = $(this).attr('pos') | 0;

            //self.setCursor(bank, nwdrome.mixer.getFade());
            nwdrome.mixer.selectPlugin(bank, pos);
            //self.showAllDescription();
        }

        for (i = 0, l = decks.length; i < l; i++) {
            var pluginsOnDeck   = decks[i],
                jmax            = Math.min(10, pluginsOnDeck.length);

            for (j = 0; j < jmax; j++) {
                var imagefile   = config.url + 'noimage.png',
                    pluginInfo  = nwdrome.plugin.getPluginInfo(pluginsOnDeck[j]);

                if (pluginInfo.thumbnail) {
                    imagefile = pluginInfo.thumbnail;
                }

                $('<img>')
                    .attr({
                        src: imagefile,
                        deck: i,
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
                    .click(thumbClicked)
                    .appendTo(divId);
            }
        }

        for (i = 0; i < decks.length; i++) {
            for (j = 0; j < this.key[i].length; j++) {
                $('<div>')
                .css({
                    position: 'absolute',
                    top: 8 + i * 124,
                    left: 110 + j * 90,
                    color: '#bbbbbb',
                    fontSize: 12
                })
                .text(this.key[i][j])
                .appendTo(divId);
            }
        }

        var selected;

        selected = nwdrome.mixer.getSelectedPluginIndex(0);
        selected = selected === -1 ? 0 : selected;
        this.setCursor(0, nwdrome.mixer.getFade());

        selected = nwdrome.mixer.getSelectedPluginIndex(1);
        selected = selected === -1 ? 0 : selected;
        this.setCursor(1, nwdrome.mixer.getFade());
    };


    // Create plugin description area
    MiniWindow.prototype.createDescArea = function(id) {
        var $div = $('<div>')
            .attr({ id: id })
            .css({
                position: 'absolute',
                width: 300
            });

        $('<div>')
            .attr("id", id + '1')
            .css({
                color: '#fff',
                backgroundColor: '#000',
                padding: '4px',
                marginBottom: 8,
                font: "bold 18px 'Times New Roman'",
                letterSpacing: ".05em"
            })
            .appendTo($div);

        $('<div>')
            .attr({ id: id + '2'})
            .css({
                color: '#fff',
                backgroundColor: '#000',
                padding: '4px 4px 8px',
                font: "14px/1.1 sans-serif",
                letterSpacing: ".06em"
            })
        .appendTo($div);

        return $div;
    };

    // Set active plugin indicator position
    MiniWindow.prototype.setCursor = function(bank, opa) {
        var pos = nwdrome.mixer.getSelectedPluginIndex(bank),
            alpha;

        opa = opa == null ? nwdrome.mixer.getFade() : opa;
        pos = pos < 0 ? 0 : pos;

        if (bank === 0) {
            alpha = opa.toFixed(1);
        } else {
            alpha = (1.0 - opa).toFixed(1);
        }

        this.cursor[bank].css({
            left: 70 + pos * 90 - 1,
            boxShadow: '0 0 5px 5px rgba(127, 127, 255,' + alpha + ')'
        });
    };


    MiniWindow.prototype.drawCommonDesc = function() {
        var desc = [
            //"[A][Z] cross fade",
            //"[S][X] audio sensitivity"
        ];

        var plugins = nwdrome.plugin.getPluginInfoList("common");

        for (var i in plugins) {
            if (plugins[i].description) {
                var s = plugins[i].description.match(/^ *\[.*$/m);
                s && desc.push(s);
            }
        }

        $('#' + this.id + '_com').html(desc.join("<br>"));
    };


    MiniWindow.prototype.showPluginDescription = function(isA) {
        var info;


        var n           = isA ? 0 : 1,
            pluginId    = nwdrome.mixer.getSelectedPluginId(n),
            pos         = nwdrome.mixer.getSelectedPluginIndex(n),
            s           = this.key[n][pos],
            elem        = isA ? this.descA : this.descB;

        if (! (info = nwdrome.plugin.getPluginInfo(pluginId))) {
            return;
        }

        var text = info.description;
        var match = text.match(/(.*)/g);
        var title = match && match[0];
        var body = text.substring(title.length + 1);

        elem.children(':first')
            .text('[' + s + '] ' + title)
            .next()
            .html(body.replace(/\n/g, '<br>'));
    };

    MiniWindow.prototype.showAllDescription = function() {
        this.showPluginDescription(true);
        this.showPluginDescription(false);
    };

    ////////////////////////
    MiniWindow.prototype.onStart    = noop;

    MiniWindow.prototype.onStop     = noop;

    MiniWindow.prototype.onFade = function(opa) {
        // Expect call from mixer#fadeChanged event listener;
        this.descA.css({opacity: 0.4 + opa});
        this.descB.css({opacity: 0.4 + (1.0 - opa)});

        this.setCursor(0, opa);
        this.setCursor(1, opa);

        this.xfader.val((opa * 100) | 0);
    };

    MiniWindow.prototype.onAudio    = noop;

    MiniWindow.prototype.onKeydown = function(keyState) {
        if (keyState.keyCode === 13) {
            this.enable = ! this.enable;

            if (this.enable) {
                this.descCommon.css({ display: 'block' });
                this.descA.css({ display: 'block' });
                this.descB.css({ display: 'block' });
                this.thumb.css({ display: 'block' });
            } else {
                this.descCommon.css({ display: 'none' });
                this.descA.css({ display: 'none' });
                this.descB.css({ display: 'none' });
                this.thumb.css({ display: 'none' });
            }
        }

        /*
        switch (keyState.keyCode) {

        case 13:		// return
            this.enable = ! this.enable;

            if (this.enable) {
                this.descCommon.css({ display: 'block' });
                this.descA.css({ display: 'block' });
                this.descB.css({ display: 'block' });
                this.thumb.css({ display: 'block' });
            } else {
                this.descCommon.css({ display: 'none' });
                this.descA.css({ display: 'none' });
                this.descB.css({ display: 'none' });
                this.thumb.css({ display: 'none' });
            }

            // app.onResize();
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
            this.showAllDescription();
            this.setCursor(0, nwdrome.mixer.getFade());
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
            this.showAllDescription();
            this.setCursor(1, nwdrome.mixer.getFade());
            break;
        }
        */
    };

    MiniWindow.prototype.onResize = noop;

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
                        this.showAllDescription();
                        this.setCursor(0, nwdrome.mixer.getFade());
                        break;

                    case 38:
                    case 39:
                    case 42:
                    case 43:
                    case 46:
                    case 47:
                    case 50:
                    case 51:
                        this.showAllDescription();
                        this.setCursor(1, nwdrome.mixer.getFade());
                        break;
                }

            case 0xB0:	// CC#
                switch (a2) {
                    case 1:
                        this.xfader.val(Math.floor(nwdrome.mixer.getFade() * 100));
                        break;
                }
                break;
        }
    }

////////////////////////

    //app && app.addCommonPlugin(new MiniWindow(app));
    return MiniWindow;
});
