$ ->
    host = window.parent.app
    
    app =
        _el      : 
            $audioSources : $("#nwjd-audioSources")

        _sources : {}

        _init : ->
            MediaStreamTrack.getSources (sources) ->
                sources.forEach (source) ->
                    app._sources[source.id] = source
                    return

                $.each app._sources, () ->
                    if this.kind isnt "audio"
                        return

                    $opt = $ "<option>"
                    $opt
                        .val this.id
                        .text this.label

                    app._el.$audioSources.append $opt
                    return

                return

            @_el.$audioSources.on "change", @_onSourceChanged
            console.log "Initialized"
            return

        _onSourceChanged : (e) =>
            dfd = do $.Deferred
            sourceId = e.target.value
            conf =
                audio :
                    optional : [{sourceId}]
            
            if app._sources[sourceId].stream?
                dfd.resolve app._sources[sourceId].stream
            else
                navigator.webkitGetUserMedia conf, (gotStream) ->
                    app._sources[sourceId].stream = gotStream
                    dfd.resolve gotStream
            
            dfd.done (stream) ->
                host.getJSdrome().init stream
                console.log "stream re-initialized"

    do app._init