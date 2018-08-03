let ws = require("nodejs-websocket");

class WebSocketServer {
    constructor() {
        this.connMap = new Map();
        this.all = ['liubiao001', 'liubiao002'];
        this.usersId = ['liubiao001', 'liubiao002'];
    }

    create() {
        this.server = ws.createServer((conn) => {
            console.log('New connection');
            conn.on("text", (str) => {
                console.log("收到的信息为:" + str);
                let msg = JSON.parse(str);
                msg.timestamp = Date.now();
                let connTemp = this.connMap.get(msg.friendId);
                !!connTemp && connTemp.sendText(JSON.stringify(msg));
            });
            conn.on("close", function (code, reason) {
                console.log("关闭连接");
            });
            conn.on("error", function (code, reason) {
                console.log("异常关闭", code, reason)
            });
        }).listen(8001);
        this.server.on('connection', (conn) => {
            let userId = this.usersId.shift();
            this.connMap.set(userId, conn);
            conn.sendText(JSON.stringify({type: 'userId', content: userId, friendsId: this.all}));
        });
        console.log("WebSocket服务端建立完毕")
    }
}

new WebSocketServer().create();