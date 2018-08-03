let ws = require("nodejs-websocket");

class WebSocketServer {
    constructor() {
        this.connMap = new Map();

        this.conversations = [{
            userId: 'liubiao001',
            headUrl: 'http://downza.img.zz314.com/edu/pc/wlgj-1008/2016-06-23/64ec0888b15773e3ba5b5f744b9df16c.jpg',//好友头像
            conversationId: -1,//会话id，目前未用到
            nickName: '柳如月',//好友昵称
            latestMsg: JSON.stringify({type: 'text',content:'周末有时间一起参加社团活动吗？'}),//最新一条消息
            unread: 0,//未读消息计数
            timestamp: 1533294362000,//最新消息的时间戳
            timeStr: '19:06'//最新消息的时间
        }, {
            userId: 'liubiao002',
            headUrl: 'http://tx.haiqq.com/uploads/allimg/170504/0641415410-1.jpg',//好友头像
            conversationId: -1,//会话id，目前未用到
            nickName: '李恺新',//好友昵称
            latestMsg: JSON.stringify({type: 'text',content:'你好，我是李恺新'}),//最新一条消息
            unread: 0,//未读消息计数
            timestamp: 1533296368000,//最新消息的时间戳
            timeStr: '19:39'//最新消息的时间
        },];
        this.usersId = ['liubiao001', 'liubiao002'];
    }

    create() {
        this.server = ws.createServer((conn) => {
            console.log('New connection');
            conn.on("text", (str) => {
                console.log("收到的信息为:" + str);
                let msg = JSON.parse(str);
                if (msg.type === 'get-conversations') {
                    conn.sendText(JSON.stringify({type: msg.type, conversations: this.conversations}));
                    return;
                }
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
            conn.sendText(JSON.stringify({type: 'login', content: userId}));
        });
        console.log("WebSocket服务端建立完毕")
    }
}

new WebSocketServer().create();