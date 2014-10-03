do (exports = window) ->
    nw = require "nw.gui"
    debugMode = (nw.App.argv.indexOf "--debug") isnt -1
    
    process.on "uncaughtException", (err) ->
        console.error err
    
    app = {}

    app._init = ->
        win_nwjd = @_windows.bootstrap = do nw.Window.get
        win_jd = @_windows.jsdrome = nw.Window.open "jsdrome/index.html"

        # initialize on debug mode.
        if debugMode
            setTimeout ->
                win_nwjd.on "devtools-closed", -> do win_nwjd.showDevTools
                do win_nwjd.showDevTools

                win_jd.on "devtools-closed", -> do win_jd.showDevTools
                do win_jd.showDevTools
            , 1000

    # public api
    app.reload = ->
        win = document.querySelector "#nwjd"
        do win.contentWindow.location.reload
        do @_windows.jsdrome.reload

    app.getJSdrome = ->
        if @_windows.jsdrome? then @_windows.jsdrome.window.app else null


    if nw.App.nwjd?
        app._windows = nw.App.nwjd._windows
    else
        app._windows =
            bootstrap   : null
            jsdrome     : null

        app._init()

    nw.App.nwjd = exports.app = app;