export default class IMWebSocket {
    constructor() {
        this._isOpen = false;
        this._onSocketOpen();
        this._onSocketMessage();
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

    setOnSocketReceiveMessageListener(cb) {
        this._socketReceiveListener = cb;
    }

    closeSocket() {
        wx.closeSocket();
    }

    onSocketError(cb) {
        wx.onSocketError((res) => {
            this._isOpen = false;
            console.log('WebSocket连接打开失败，请检查！', res);
        })
    }

    onSocketClose(cb) {
        wx.onSocketClose((res) => {
            this._isOpen = false;
            this._socket = null;
            console.log('WebSocket 已关闭！', res)
        });
    }

    _onSocketOpen() {
        wx.onSocketOpen((res) => {
            this._isOpen = true;
            console.log('WebSocket连接已打开！');
        });
    }

    _onSocketMessage() {
        wx.onSocketMessage((res) => {
            let msg = JSON.parse(res.data);
            if ('userId' === msg.type) {
                getApp().globalData.userId = msg.content;
            } else {
                this._socketReceiveListener && this._socketReceiveListener(msg);
            }
            console.log('收到服务器内容：' + res.data)
        })
    }

}