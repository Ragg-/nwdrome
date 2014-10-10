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



##
# Effector plugin structure
#
JSdrome.addEffectorPlugin (pluginConfig)->
    class EffectorPlugin

        # Plugin detail setting to instance or prototype
        id          : "vendor.Plugin-ID"
        description : "Plugin \nDescription"
        thumbnail   : "path/to/thumbnail.image" # relative from plugin root

        constructor : () ->
            # do initialize
            @_canvas = canvas
            @_ctx    = canvas.getContext "2d"

        # @param HTMLCanvasElement jsdrome master canvas. Has been written mixed(faded) image.
        onStart     : (canvas)->
            # Call when starting draw.

        onStop      : ->
            # Call when stopping draw.

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
    return EffectorPlugin
