let ws = require("nodejs-websocket");

class WebSocketServer {
    constructor() {

    }

    create() {
        this.server = ws.createServer(function (conn) {
            console.log('New connection');
            conn.on("text", function (str) {
                console.log("收到的信息为:" + str);
                let msg = JSON.parse(str);
                let callbackMsg = null;
                switch (msg.type) {
                    case 'custom':
                        callbackMsg = {type: msg.type, content: '这是来自服务器的自定义消息'};
                        break;
                    case 'image':
                        callbackMsg = {type: msg.type, content: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1533299767768&di=8df0bf650dcba15aa2a238c00df0f74a&imgtype=0&src=http%3A%2F%2Fpic.58pic.com%2F58pic%2F13%2F19%2F80%2F77H58PICYGD_1024.jpg'};
                        break;
                    case 'voice':
                        callbackMsg = {type: 'text', content: '这里可以配置语音url来模拟回复图片消息'};
                        break;
                    case 'text':
                        callbackMsg = {type: msg.type, content: '你好呀，我是WebSocket服务器自动回复的消息'}
                }
                callbackMsg.timestamp = Date.now();
                conn.sendText(JSON.stringify(callbackMsg));
            })
            conn.on("close", function (code, reason) {
                console.log("关闭连接")
            });
            conn.on("error", function (code, reason) {
                console.log("异常关闭", code, reason)
            });
        }).listen(8001);
        this.server.on('connection', function (conn) {
            conn.sendText(JSON.stringify({type: 'sessionId', content: Date.now()}));
        });
        console.log("WebSocket服务端建立完毕")
    }
}

new WebSocketServer().create();