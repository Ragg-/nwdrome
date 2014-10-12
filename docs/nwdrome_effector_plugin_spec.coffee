# nwdrome-effector-plugin spec
# Copyright 2014, Ragg(@_ragg_)

###

# Nwdrome effector plugin specification

## Register plugin
Call `nwdrome.plugin.addEffector` with `factory function`
Factory function given plugin config object.

Below Plugin config object properties.

- appUrl  :string  Application(nwdrome) root path. End with "/"
- url     :string  Plugin root path. End with "/"

## Plugin information
Plugin constructor must having plugin info properties!!

- id            :string  Plugin ID (example: "yourname.pluginname")
- description   :string  Plugin description.
- thumbnail     :string  Path to plugin thumbnail.
###


###
Exapmle
###
nwdrome.plugin.addEffector (pluginConfig)->

    class EffectorPlugin
        # Plugin detail set to plugin constructor
        @id          : "vendor.Plugin-ID"
        @description : "Plugin \nDescription"
        @thumbnail   : pluginConfig.url + "path/to/thumbnail.image"


        # @param HTMLCanvasElement jsdrome master canvas. Has been written mixed(faded) image.
        constructor : (canvas) ->
            # hold destination canvas
            @_canvas = canvas

        onStart     : () ->
            # Call when starting draw.

        onStop      : () ->
            # Call when stopping draw.

        # @param float Realtime volume
        # @param float Part volume
        onAudio     : (moment, period) ->
            # The state of the audio volume will be notified.

        # @param int new width
        # @param int new height
        onResize    : (width, height) ->
            # Be notified of canvas size change.

        # @param HTMLCanvasElement[]  plugin destination canvases.
        onTimer     : (activePluginDestination)->
            # Call from nwdrome when requestAnimationFrame fired.
            # Will rendering process write here.

        # @param int keyCode
        onKeydown   : (keyCode) ->
            # Call on key input and route to this instance.


        onMidi      : (a1, a2, a3) ->
            # Be notified of midi input(maybe...)

    # return constructor
    return EffectorPlugin
