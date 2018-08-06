let ws = require("nodejs-websocket");

/**
 * 这个类是模拟webSocket服务端
 */
class WebSocketServer {
    constructor() {
        this.connMap = new Map();
        this._count = 0;
        this.users = [{
            userId: 'user_001',
            nickName: '柳如月',
            myHeadUrl: 'http://downza.img.zz314.com/edu/pc/wlgj-1008/2016-06-23/64ec0888b15773e3ba5b5f744b9df16c.jpg'
        }, {
            userId: 'user_002',
            nickName: '李恺新',
            myHeadUrl: 'http://tx.haiqq.com/uploads/allimg/170504/0641415410-1.jpg'
        }];

        this.msgHistory = {};
        this.msgHistory[`${this.users[0].userId}`] = [{
            content: JSON.stringify({
                "type": "text",
                "content": "周末有时间一起参加社团活动吗？"
            }),
            friendId: this.users[1].userId,
            friendHeadUrl: this.users[1].myHeadUrl,
            friendName: this.users[1].nickName,
            msgUserId: this.users[1].userId,
            timestamp: 1533294362000,
            timeStr: '19:06'
        }];
        this.msgHistory[`${this.users[1].userId}`] = [{
            content: JSON.stringify({
                "type": "text",
                "content": "周末有时间一起参加社团活动吗？"
            }),
            friendId: this.users[0].userId,
            friendHeadUrl: this.users[0].myHeadUrl,
            friendName: this.users[0].nickName,
            msgUserId: this.users[0].userId,
            timestamp: 1533296368000,
            timeStr: '19:39',
        }];
        const oneLatestMsgObj = this.msgHistory[this.users[0].userId][0];
        const otherLatestMsgObj = this.msgHistory[this.users[1].userId][0];
        this.conversations = [{
            userId: this.users[0].userId,
            friendId: oneLatestMsgObj.friendId,
            msgUserId: oneLatestMsgObj.msgUserId,//消息的所有人id
            friendHeadUrl: oneLatestMsgObj.friendHeadUrl,//好友头像
            conversationId: -1,//会话id，目前未用到
            friendName: oneLatestMsgObj.friendName,//好友昵称
            latestMsg: oneLatestMsgObj.content,//最新一条消息
            unread: 1,//未读消息计数
            timestamp: oneLatestMsgObj.timestamp,//最新消息的时间戳
            timeStr: oneLatestMsgObj.timeStr//最新消息的时间
        }, {
            userId: this.users[1].userId,
            friendId: otherLatestMsgObj.friendId,
            msgUserId: otherLatestMsgObj.msgUserId,//消息的所有人id
            friendHeadUrl: otherLatestMsgObj.friendHeadUrl,//好友头像
            conversationId: -1,//会话id，目前未用到
            friendName: otherLatestMsgObj.friendName,//好友昵称
            latestMsg: otherLatestMsgObj.content,//最新一条消息
            unread: 0,//未读消息计数
            timestamp: otherLatestMsgObj.timestamp,//最新消息的时间戳
            timeStr: otherLatestMsgObj.timeStr//最新消息的时间
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
                        conversations: this.conversations.filter(item => item.userId === msg.userId)
                    }));
                    return;
                } else if (msg.type === 'get-history') {
                    let temp;
                    this.msgHistory[msg.userId].filter(item => item.friendId === msg.friendId).forEach(item => {
                        temp = JSON.parse(item.content);
                        conn.sendText(JSON.stringify({
                            type: temp.type,
                            content: temp.content,
                            msgUserId: item.msgUserId,
                            userId: msg.userId,
                            friendId: item.friendId,
                            timestamp: item.timestamp,
                            timeStr: item.timeStr
                        }));
                    });
                    return;
                } else if (msg.type === 'get-friends') {
                    conn.sendText(JSON.stringify({
                        type: msg.type,
                        friends: this.users.filter(item => item.userId !== msg.userId)
                    }));


                    return;
                }
                msg.timestamp = Date.now();
                let connTemp = this.connMap.get(msg.friendId);
                const msgSendFinally = JSON.stringify(msg);
                // let myHistoryList = this.msgHistory[msg.userId] || (this.msgHistory[msg.userId] = []);
                // let friendHistoryList = this.msgHistory[msg.friendsId] || (this.msgHistory[msg.friendsId] = []);
                // myHistoryList.push();
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
            this._count = this._count >= this.users.length ? 0 : this._count;
            let user = this.users[this._count];
            this.connMap.set(user.userId, conn);
            conn.sendText(JSON.stringify({type: 'login', userInfo: user}));
            this._count++;
        });
        console.log("WebSocket服务端建立完毕")
    }
}

new WebSocketServer().create();