# nwdrome-renderer-plugin example
# Copyright 2014, Ragg(@_ragg_)

#
# Plugin interface specification
#

# Register plugin
#   JSdrome.addRendererPlugin(function)
#   JSdrome.addCommonPlugin(insert_flag, function)
#
#   addRendererPlugin
#       function    plugin constructor factory (returns constructor)
#
#   addCommonPlugin
#       string      BEFORE_FILTER|AFTER_FILTER  Specify common plugin rendering timing.
#       function    plugin constructor factory (returns constructor)
#
#   addEffectorPlugin
#       function    plugin constructor factory (returns constructor)
#



##
# Renderer plugin (& common plugin) structure
#
JSdrome.addRendererPlugin (pluginConfig)->
    class RendererPlugin

        # Plugin detail setting to instance or prototype
        id          : "vendor.Plugin-ID"
        description : "Plugin \nDescription"
        thumbnail   : "path/to/thumbnail.image" # relative from plugin root

        # @param HTMLCanvasElement Rendering result destination canvas
        constructor : (canvas) ->
            # do initialize
            @_canvas = canvas
            @_ctx    = canvas.getContext "2d"

        onStart     : ->
            # Call when starting draw.

        onStop      : ->
            # Call when stopping draw.

        # @param float Current opacity(0.0 - 1.0)
        onFade      : (opacity) ->
            # Call when opacity changed.

        # @param float Realtime volume
        # @param float Part volume
        onAudio     : (moment, period) ->
            # The state of the audio volume will be notified.

        # @param int new width
        # @param int new height
        onResize    : (width, height) ->
            # Be notified of canvas size change.

        onTimer     : ->
            # Call from jsdrome's requestAnimationFrame.
            # Will rendering process write here.

        # @param int keyCode
        onKeydown   : (keyCode) ->
            # If plugin in foreground, will be notified of key input.

        # Unknown...
        onMidi      : (a1, a2, a3) ->
            # Be notified of midi input

    # return constructor
    return RendererPlugin



# nwdrome-common-plugin spec
# Copyright 2014, Ragg(@_ragg_)

###

# Nwdrome common plugin specification

## Register plugin
Call `nwdrome.plugin.addCommon` with `factory function`
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
nwdrome.plugin.addCommon (pluginConfig)->

    class CommonPlugin
        # Plugin detail set to plugin constructor
        @id          : "vendor.Plugin-ID"
        @description : "Plugin \nDescription"
        @thumbnail   : pluginConfig.url + "path/to/thumbnail.image"


        constructor : () ->

        onStart     : () ->
            # Call when start.

        onStop      : () ->
            # Call when stop.

        # @param float Realtime volume
        # @param float Part volume
        onAudio     : (moment, period) ->
            # The state of the audio volume will be notified.

        # @param int new width
        # @param int new height
        onResize    : (width, height) ->
            # Be notified of canvas size change.

        onTimer     : ->
            # Call from nwdrome when requestAnimationFrame fired.
            # Will rendering process write here.

        # @param int keyCode
        onKeydown   : (keyCode) ->
            # Call on key input and route to this instance.


        onMidi      : (a1, a2, a3) ->
            # Be notified of midi input(maybe...)

    # return constructor
    return CommonPlugin

