(function () {
    var nw      = require("nw.gui"),
        guiWin  = nw.Window.get();

    window.onkeydown = function (e) {
        if ((e.ctrlKey || e.metaKey) && e.keyCode === 87) {
            guiWin.hide();
            guiWin.emit("hide");
            e.preventDefault();
        }
    };
}());
