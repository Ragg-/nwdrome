requirejs [], () ->
    nw = window.require 'nw.gui'

    ######
    # Initialize Node-Webkit
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
        #window.onerror = uncaughtCallback

        window.addEventListener "beforeunload", ->
            process.removeListener "uncaughtException", uncaughtCallback
            console.log "Exception listener dispose successfully"
            return
        , false

    ######
    # Initialize window gui
    $ ->
        externalWindow = nw.Window.open "view.html",
            frame: false
            show : false
            toolbar : false

        nwdromeWindow = document.getElementById("nwdrome-frame").contentWindow

        $e =
            # Audio source list
            audioSourceList : $ "#nwdm-audioSources"

            # External window open button
            externalOpenner : $ "#nwdm-externalWindow"

        $window = $(window)

        getNwdrome = ->
            nwdromeWindow.nwdrome


        # Listup all media sources to pulldown
        MediaStreamTrack.getSources (sources) ->
            $.each sources, () ->
                if this.kind isnt "audio"
                    return

                $ "<option>"
                    .val this.id
                    .text this.label
                    .appendTo $e.audioSourceList
                return
            return


        # event: External window has closing
        externalWindow.on "hide", ->
            canvas = getNwdrome().mixer.getDestination();
            canvas.inExternal = false

            $("#nwdrome_container", nwdromeWindow.document)
                .prepend canvas
            return


        # event: External window resize
        externalWindow.on "resize", do ->
            timerId = null

            return (w, h) ->
                if timerId isnt null
                    clearTimeout timerId

                timerId = setTimeout ->
                    getNwdrome().notifyResize w, h
                , 100


        # event: Audio source changed
        $e.audioSourceList.on "change", ->
            this.blur()

            conf =
                audio :
                    optional : [
                        sourceId: @value
                    ]

            navigator.webkitGetUserMedia conf, (stream) ->
                getNwdrome().audio.setAudioInput stream
                console.info "Successfully input source change."

            return


        # event: Request open exeternal window
        $e.externalOpenner.on "click", ->
            nwdrome = getNwdrome()
            canvas = nwdrome.mixer.getDestination()
            canvas.inExternal = true

            externalWindow.window.document.body.appendChild canvas
            nwdrome.notifyResize externalWindow.width, externalWindow.height
            externalWindow.show()
            canvas = null
            return


        # event: Reloading
        $("#nwdm-reload").on "click", ->
            location.reload()


        # event: Delegate any key inputs to nwdrome window
        $window.on "keydown", (e) ->
            nwdromeWindow.dispatchEvent e.originalEvent
            return


        # event: Destruct main window
        $window.on "beforeunload", ->
            externalWindow.close()
            externalWindow = undefined


        ###

        _events :

            fading : ->
                App._nwdrome?.mixer.setFade @value / 100

            faderChanged : (opacity) ->
                App._el.$c_fader[0].value = (opacity * 100) | 0
                return
        ###

        console.info "App initialized."
