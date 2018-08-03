export default class ChatListManager {
    constructor() {

    }

    static getConversationsItem(item) {
        let {latestMsg, ...msg} = item;
        return Object.assign(msg, JSON.parse(latestMsg));
        // return {
        //     conversationId: item.conversationId,//会话id，目前未用到
        //     headUrl: item.headUrl,//好友头像
        //     nickName: item.nickName,//好友昵称
        //     type: temp.type,//最新消息的类型
        //     content: temp.content,//最新一条消息
        //     unread: item.,//未读消息计数
        //     timestamp: 0,//最新消息的时间戳
        //     timeStr: '09:03'//最新消息的时间
        // };
    }
}