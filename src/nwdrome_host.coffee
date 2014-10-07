$ ->
    nw = window.require 'nw.gui'


    ###
    # Initialize Node-Webkit
    ###
    do ->
        nwWin = nw.Window.get()
        debugMode = (nw.App.argv.indexOf "--debug") isnt -1

        # Open developer tools
        if debugMode
            nwWin.on "devtools-closed", -> nwWin.showDevTools()
            nwWin.showDevTools()


        # Handling exception
        uncaughtCallback = (ex) ->
            console.groupCollapsed? "%cUncaught exception: #{ex.message}", "color:red"
            console.debug "%c#{ex.message}", "color:red"
            console.debug "%cStack\n#{ex.stack}", "color:red"
            console.groupEnd?()

        process.on "uncaughtException", uncaughtCallback
        window.onerror = uncaughtCallback

        window.addEventListener "beforeunload", ->
            process.removeListener "uncaughtException", uncaughtCallback
            console.log "Exception listener dispose successfully"
            return
        , false


    ###
    # Initialize App
    ###
    App =
        _jsdrome : null
        _exWindow: null

        _loaded  : $.Deferred()

        _el      :
            $c_audioSources     : $ "#jdnw-audioSources"
            $c_externalWindow   : $ "#jdnw-externalWindow"
            $c_fader            : $ "#jdnw-fade"
            $subWindow : null

        _sources : {}

        _init : ->
            # Initialize JSdrome
            $subWindow = $("#jsdrome-frame")
            $subWindow
                .attr "src", "core/index.html"
                .on "load", ->
                    App._jsdrome = window.app = @contentWindow.nwdrome
                    App._loaded.resolve App


            # Initialize audio device list
            MediaStreamTrack.getSources (sources) ->
                sources.forEach (source) ->
                    App._sources[source.id] = source
                    return

                $.each App._sources, () ->
                    if this.kind isnt "audio"
                        return

                    $ "<option>"
                        .val this.id
                        .text this.label
                        .appendTo App._el.$c_audioSources
                    return

                return

            # Initialize DOM event listeners
            @_el.$c_audioSources.on "change", @_events.onSourceChanged
            $(window)
                .on "keyup", @_events.delegateKeyup
                .on "keydown", @_events.delegateKeydown

            @_el.$c_externalWindow.on "click", @_events.showInExternal

            @_el.$c_fader.on "change", @_events.fading

            console.log "Initialized"
            return


        getJSdrome : -> @_jsdrome

        _events :
            showInExternal : ->
                if App._exWindow?
                    App._exWindow.open();
                else
                    App._exWindow = nw.Window.open 'view.html', frame : false

            fading : ->
                App._jsdrome?.setFade @value / 100


            delegateKeyup : (e) ->
                App._jsdrome?.onKeyup e


            delegateKeydown : (e) ->
                App._jsdrome?.onKeydown e


            onSourceChanged : (e) ->
                this.blur()

                dfd = $.Deferred()
                sourceId = e.target.value
                conf =
                    audio :
                        optional : [{sourceId}]

                if App._sources[sourceId].stream?
                    dfd.resolve App._sources[sourceId].stream
                else
                    navigator.webkitGetUserMedia conf, (gotStream) ->
                        App._sources[sourceId].stream = gotStream
                        dfd.resolve gotStream

                dfd.done (stream) ->
                    App.getJSdrome().setAudioInputSource stream
                    console.log "stream re-initialized"

            faderChanged : (opacity) ->
                App._el.$c_fader[0].value = (opacity * 100) | 0

        waitForInit : (fn) -> @_loaded.done fn

        reload : ->
            nw.Window.get().reload()


    App._init()
    console.info "App initialized."
