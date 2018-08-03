//app.js
import IMWebSocket from "./modules/im-sdk/im-web-socket";

App({
    getIMWebSocket() {
        return this.imWebSocket;
    },
    onLaunch() {
        this.imWebSocket = new IMWebSocket();
        this.imWebSocket.onSocketOpen();
        this.imWebSocket.onSocketMessage();
    },
    onHide() {
        this.imWebSocket.closeSocket();
    },
    onShow() {
        this.imWebSocket.createSocket();
    }
});