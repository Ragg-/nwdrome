module.exports = (grunt) ->
    PATHS =
        "Windows_NT"    : "bin\\nw.exe\\nw.exe"
        "Darwin"        : "bin/node-webkit.app/Contents/MacOS/node-webkit"

    os      = require("os")
    path    = require("path")
    spawn   = require("child_process").spawn

    debug = ->
        DS      = path.sep
        bin     = PATHS[os.type()]
        proc    = null
        
        try
            if bin?
                proc = spawn bin, ["--debug", "src" + DS], {detached: true}
            else
                grunt.fail.fatal "Unsupported environment (#{os.type()})"
        
        catch e
            console.error e

    grunt.initConfig
        nodewebkit  :
            src     : ["./compiled/**/*"] # Your node-webkit app
            options :
                platforms   : ['win', 'osx']
                version     : "0.10.4"
                buildDir    : "./release"
                cacheFir    : "./release/cache"
                #macCredits  :
                #macIcns     :
                #winIco      :

    # loadTasks
    grunt.loadNpmTasks "grunt-node-webkit-builder"

    # regist Tasks
    grunt.registerTask "debug", debug
    grunt.registerTask "release", ["nodewebkit"]
