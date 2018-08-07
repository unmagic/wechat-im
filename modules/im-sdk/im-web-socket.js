export default class IMWebSocket {
    constructor() {
        this._isLogin = false;
        this._msgQueue = [];
        this._onSocketOpen();
        this._onSocketMessage();
        this._onSocketError();
        this._onSocketClose();
    }

    /**
     * 创建WebSocket连接
     * 如：this.imWebSocket = new IMWebSocket();
     *    this.imWebSocket.createSocket({url: 'ws://10.4.97.87:8001'});
     * 如果你使用本地服务器来测试，那么这里的url需要用ws，而不是wss，因为用wss无法成功连接到本地服务器
     * @param url 传入你的服务端地址，端口号不是必需的。
     */
    createSocket({url}) {
        !this._isLogin && wx.connectSocket({
            url,
            header: {
                'content-type': 'application/json'
            },
            method: 'GET'
        });
    }

    /**
     * 发送消息
     * @param content 需要发送的消息，是一个对象，如{type:'text',content:'abc'}
     * @param success 发送成功回调
     * @param fail 发送失败回调
     */
    sendMsg({content, success, fail}) {
        if (this._isLogin) {
            this._sendMsg({content, success, fail});
        } else {
            this._msgQueue.push(content);
        }
    }

    _sendMsg({content, success, fail}) {
        wx.sendSocketMessage({
            data: JSON.stringify(content), success: () => {
                success && success(content);
            },
            fail: (res) => {
                fail && fail(res);
            }
        });
    }

    /**
     * 消息接收监听函数
     * @param listener
     */
    setOnSocketReceiveMessageListener({listener}) {
        this._socketReceiveListener = listener;
    }

    /**
     * 关闭webSocket
     */
    closeSocket() {
        wx.closeSocket();
    }

    _onSocketError(cb) {
        wx.onSocketError((res) => {
            this._isLogin = false;
            console.log('WebSocket连接打开失败，请检查！', res);
        })
    }

    _onSocketClose(cb) {
        wx.onSocketClose((res) => {
            this._isLogin = false;
            console.log('WebSocket 已关闭！', res)
        });
    }

    _onSocketOpen() {
        wx.onSocketOpen((res) => {
            console.log('WebSocket连接已打开！');
        });
    }

    /**
     * webSocket是在这里接收消息的
     * 在socket连接成功时，服务器会主动给客户端推送一条消息类型为login的信息，携带了用户的基本信息，如id，头像和昵称。
     * 在login信息接收前发送的所有消息，都会被推到msgQueue队列中，在登录成功后会自动重新发送。
     * 这里我进行了事件的分发，接收到非login类型的消息，会回调监听函数。
     * @private
     */
    _onSocketMessage() {
        wx.onSocketMessage((res) => {
            let msg = JSON.parse(res.data);
            if ('login' === msg.type) {
                this._isLogin = true;
                getApp().globalData.userInfo = msg.userInfo;
                getApp().globalData.friendsId = msg.friendsId;
                if (this._msgQueue.length) {
                    let temp;
                    while (temp = this._msgQueue.shift()) {
                        this._sendMsg({content: {...temp, userId: msg.userInfo.userId}});
                    }
                }
            } else {
                this._socketReceiveListener && this._socketReceiveListener(msg);
            }
        })
    }

}