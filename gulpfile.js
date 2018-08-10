var gulp = require("gulp");
var WebSocketServer = require("./.server/web-socket-server");
gulp.task("default", function () {
    new WebSocketServer().create();
});