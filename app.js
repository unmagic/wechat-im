//app.js
import IMWebSocket from "./modules/im-sdk/im-web-socket";

App({
    globalData: {
        userInfo: {},
    },
    getIMWebSocket() {
        return this.imWebSocket;
    },
    onLaunch() {
        this.imWebSocket = new IMWebSocket();

    },
    onHide() {
        // this.imWebSocket.closeSocket();
    },
    onShow() {
        this.imWebSocket.createSocket({url: 'ws://10.4.97.87:8001'});
    }
});