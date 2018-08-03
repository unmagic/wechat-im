export default class IMWebSocket {
    constructor() {
        this._isOpen = false;
    }

    createSocket() {
        if (!this._socket) {
            this._socket = wx.connectSocket({
                url: 'ws://10.4.98.115:8001',
                header: {
                    'content-type': 'application/json'
                },
                method: 'GET'
            });
        }
    }

    sendMsg({content, success, fail}) {
        if (this._isOpen) {
            wx.sendSocketMessage({data: content});
            success && success(content);
        } else {
            fail && fail();
        }
    }

    onSocketOpen(cb) {
        wx.onSocketOpen((res) => {
            this._isOpen = true;
            cb && cb();
            console.log('WebSocket连接已打开！');
        });
    }

    onSocketError(cb) {
        wx.onSocketError((res) => {
            this._isOpen = false;
            console.log('WebSocket连接打开失败，请检查！', res);
        })
    }

    setOnSocketReceiveMessageListener(cb) {
        this._socketReceiveListener = cb;
    }

    onSocketMessage() {
        wx.onSocketMessage((res) => {
            let msg = JSON.parse(res.data);
            if ('sessionId' === msg.type) {
                getApp().globalData.sessionId = msg.content;
            } else {
                this._socketReceiveListener && this._socketReceiveListener(msg);
            }
            console.log('收到服务器内容：' + res.data)
        })
    }

    onSocketClose(cb) {
        wx.onSocketClose((res) => {
            this._isOpen = false;
            this._socket = null;
            console.log('WebSocket 已关闭！', res)
        });
    }

    closeSocket() {
        wx.closeSocket();
    }
}