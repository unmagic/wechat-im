let ws = require("nodejs-websocket");

/**
 * 这个类是模拟webSocket服务端
 */
class WebSocketServer {
    constructor() {
        this.connMap = new Map();
        this.usersId = ['user_001', 'user_002'];
        this.msgHistory = {};
        this.msgHistory[`${this.usersId[0]}`] = [{
            content: JSON.stringify({
                "type": "text",
                "content": "周末有时间一起参加社团活动吗？"
            }),
            friendId: this.usersId[1],
            timestamp: 1533294362000,
            timeStr: '19:06'
        }];
        this.msgHistory[`${this.usersId[1]}`] = [{
            content: JSON.stringify({
                "type": "text",
                "content": "周末有时间一起参加社团活动吗？"
            }),
            friendId: this.usersId[0],
            timestamp: 1533296368000,
            timeStr: '19:39'
        }];
        const firstLatestMsgObj = this.msgHistory[this.usersId[0]][0];
        const secondLatestMsgObj = this.msgHistory[this.usersId[1]][0];
        this.conversations = [{
            userId: this.usersId[0],
            friendId: firstLatestMsgObj.friendId,
            friendHeadUrl: 'http://downza.img.zz314.com/edu/pc/wlgj-1008/2016-06-23/64ec0888b15773e3ba5b5f744b9df16c.jpg',//好友头像
            conversationId: -1,//会话id，目前未用到
            friendName: '柳如月',//好友昵称
            latestMsg: firstLatestMsgObj.content,//最新一条消息
            unread: 0,//未读消息计数
            timestamp: firstLatestMsgObj.timestamp,//最新消息的时间戳
            timeStr: firstLatestMsgObj.timeStr//最新消息的时间
        }, {
            userId: this.usersId[1],
            friendId: secondLatestMsgObj.friendId,
            friendHeadUrl: 'http://tx.haiqq.com/uploads/allimg/170504/0641415410-1.jpg',//好友头像
            conversationId: -1,//会话id，目前未用到
            friendName: '李恺新',//好友昵称
            latestMsg: secondLatestMsgObj.content,//最新一条消息
            unread: 1,//未读消息计数
            timestamp: secondLatestMsgObj.timestamp,//最新消息的时间戳
            timeStr: secondLatestMsgObj.timeStr//最新消息的时间
        }];

    }

    create() {
        this.server = ws.createServer((conn) => {
            console.log('New connection');
            conn.on("text", (str) => {
                console.log("收到的信息为:" + str);
                let msg = JSON.parse(str);
                if (msg.type === 'get-conversations') {
                    conn.sendText(JSON.stringify({
                        type: msg.type,
                        conversations: this.conversations.filter(item => item.userId !== msg.userId)
                    }));
                    return;
                }
                msg.timestamp = Date.now();
                let connTemp = this.connMap.get(msg.friendId);
                const msgSendFinally = JSON.stringify(msg);
                let myHistoryList = this.msgHistory[msg.userId] || (this.msgHistory[msg.userId] = []);
                let friendHistoryList = this.msgHistory[msg.friendsId] || (this.msgHistory[msg.friendsId] = []);
                myHistoryList.push();
                !!connTemp && connTemp.sendText(msgSendFinally);
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