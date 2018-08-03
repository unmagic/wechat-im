export default class IMWebSocket {
    constructor() {
        wx.connectSocket({
            url: '',
            header: {
                'content-type': 'application/json'
            },
            method: 'GET'
        });
    }

    onSocketOpen(cb) {
        wx.onSocketOpen(function (res) {
            console.log('WebSocket连接已打开！')
        });
    }

    onSocketError(cb) {
        wx.onSocketError(function (res) {
            console.log('WebSocket连接打开失败，请检查！')
        })
    }

    onSocketMessage(cb) {
        wx.onSocketMessage(function (res) {
            console.log('收到服务器内容：' + res.data)
        })
    }

    onSocketClose(cb) {
        wx.onSocketClose(function (res) {
            console.log('WebSocket 已关闭！')
        });
    }

    closeSocket() {
        wx.closeSocket();
    }
}