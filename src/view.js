(function () {
    var nw      = require("nw.gui"),
        guiWin  = nw.Window.get();

    var ma

    window.onkeydown = function (e) {
        if (e.keyCode === 27 || ((e.ctrlKey || e.metaKey) && e.keyCode === 87)) {
            // (Control | Command) + W
            guiWin.hide();
            guiWin.emit("hide");
            e.preventDefault();
        }

        if (e.keyCode === 13) {
            // Enter
            guiWin.maximize();
        }
    };
}());
