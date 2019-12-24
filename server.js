var WebSocketServer = require("./.server/web-socket-server");

new WebSocketServer().create();
// setTimeout(function () {
//     socketServer.close();
//     socketServer = null;
// }, 4000);
