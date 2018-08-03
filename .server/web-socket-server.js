import IMOperator from "../pages/chat/im-operator";

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
                let callbackMsg = '';
                switch (msg.type) {
                    case IMOperator.CustomType:
                        callbackMsg = IMOperator.createChatItemContent({type: msg.type, content: '这是来自服务器的自定义消息'});
                        break;
                    case IMOperator.ImageType:
                        callbackMsg = IMOperator.createChatItemContent({type: msg.type, content: '这里可以配置图片url来模拟回复图片消息'});
                        break;
                    case IMOperator.VoiceType:
                        callbackMsg = IMOperator.createChatItemContent({type: msg.type, content: '这里可以配置语音url来模拟回复语音消息'});
                        break;
                    case IMOperator.TextType:
                        callbackMsg = IMOperator.createChatItemContent({type: msg.type, content: '这是来自服务器的自定义消息'});
                }
                conn.sendText(str)
            })
            conn.on("close", function (code, reason) {
                console.log("关闭连接")
            });
            conn.on("error", function (code, reason) {
                console.log("异常关闭", code, reason)
            });
        }).listen(8001);
        console.log("WebSocket建立完毕")
    }
}

new WebSocketServer().create();