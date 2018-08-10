var gulp = require("gulp");
var WebSocketServer = require("./.server/web-socket-server");
var socketServer = new WebSocketServer();
gulp.task("default", function () {
    return socketServer.create();
});

gulp.task("travis", ["default"], function (res) {
    setTimeout(function () {
        socketServer.close();
        socketServer = null;
    }, 4000);
});