/**
 * 由于JavaScript没有抽象方法，所以我编写了这个IM基类，
 * 将你自己的IM的实现类继承这个类就可以了
 * 我把IM通信的常用方法封装在这里，
 * 有些实现了具体细节，但有些没实现，是作为抽象函数，由子类去实现细节，这点是大家需要注意的
 */
export default class IIMHandler {
    constructor() {
        this._isLogin = false;
        this._msgQueue = [];
        this._receiveListener = null;
    }

    /**
     * 创建WebSocket连接
     * 如：this.imWebSocket = new IMWebSocket();
     *    this.imWebSocket.createSocket({url: 'ws://10.4.97.87:8001'});
     * 如果你使用本地服务器来测试，那么这里的url需要用ws，而不是wss，因为用wss无法成功连接到本地服务器
     * @param url 传入你的服务端地址，端口号不是必需的。
     */
    createConnection({url}) {
        // 作为抽象函数
    }


    /**
     * 发送消息
     * @param content 需要发送的消息，是一个对象，如{type:'text',content:'abc'}
     * @param success 发送成功回调
     * @param fail 发送失败回调
     */
    sendMsg({content, success, fail}) {
        if (this._isLogin) {
            this._sendMsgImp({content, success, fail});
        } else {
            this._msgQueue.push(content);
        }
    }

    /**
     * 消息接收监听函数
     * @param listener
     */
    setOnReceiveMessageListener({listener}) {
        this._receiveListener = listener;
    }

    closeConnection() {
        // 作为抽象函数
    }

    _sendMsgImp({content, success, fail}) {
        // 作为抽象函数
    }
}