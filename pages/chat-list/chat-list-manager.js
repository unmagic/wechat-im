import IMOperator from "../chat/im-operator";

export default class ChatListManager {
    constructor() {

    }

    static getConversationsItem() {
        return {
            conversationId: 1,//会话id
            headUrl: '',//好友头像
            nickName: '万志山',//好友昵称
            latestMsgType: IMOperator.TextType,//最新消息的类型
            latestMsg: '周末有时间一起参加社团活动吗？',//最新一条消息
            unread: 0,//未读消息计数
            timestamp: 0,//最新消息的时间戳
            timeStr: '09:03'//最新消息的时间
        };
    }
}