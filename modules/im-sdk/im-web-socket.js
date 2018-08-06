export default class IMWebSocket {
    constructor() {
        this._isOpen = false;
        this._msgQueen = [];
        this._onSocketOpen();
        this._onSocketMessage();
        this._onSocketError();
        this._onSocketClose();
    }

    createSocket() {
        if (!this._socket) {
            this._socket = wx.connectSocket({
                url: 'ws://10.4.97.87:8001',
                header: {
                    'content-type': 'application/json'
                },
                method: 'GET'
            });
        }
    }

    sendMsg({content, success, fail}) {
        if (this._isOpen) {
            this._sendMsg({content, success, fail});
        } else {
            console.log('添加到数组中', content);
            this._msgQueen.push(content);
        }
    }

    _sendMsg({content, success, fail}) {
        wx.sendSocketMessage({
            data: JSON.stringify(content), success: () => {
                success && success(content);
            },
            fail: (res) => {
                console.log('发送失败', res);
                fail && fail();
            }
        });
    }

    setOnSocketReceiveMessageListener(cb) {
        this._socketReceiveListener = cb;
    }

    closeSocket() {
        wx.closeSocket();
    }

    _onSocketError(cb) {
        wx.onSocketError((res) => {
            this._isOpen = false;
            console.log('WebSocket连接打开失败，请检查！', res);
        })
    }

    _onSocketClose(cb) {
        wx.onSocketClose((res) => {
            this._isOpen = false;
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
            if ('login' === msg.type) {
                console.log(msg.userInfo);
                getApp().globalData.userInfo = msg.userInfo;
                getApp().globalData.friendsId = msg.friendsId;
                if (this._msgQueen.length) {
                    let temp;
                    while (temp = this._msgQueen.shift()) {
                        this._sendMsg({content: {...temp, userId: msg.userInfo.userId}});
                    }
                }
            } else {
                this._socketReceiveListener && this._socketReceiveListener(msg);
            }
        })
    }

}