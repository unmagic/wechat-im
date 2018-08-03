export default class IMWebSocket {
    constructor() {
        this._isOpen = false;
        this._sockeMsgQueen = [];
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

    sendMsg({content}) {
        this._sockeMsgQueen.push(content);

        if (this._isOpen) {
            let temp;
            while (temp = this._sockeMsgQueen.shift()) {
                wx.sendSocketMessage({data: temp});
            }
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

    onSocketMessage(cb) {
        wx.onSocketMessage((res) => {
            cb && cb();
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