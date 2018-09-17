// pages/chat-list/chat-list.js
import regeneratorRuntime from "./regenerator-runtime";

/**
 * 会话列表页面
 */
Page({

    /**
     * 页面的初始数据
     */
    data: {
        conversations: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad (options) {

    },

    toChat (e) {
        let item = e.currentTarget.dataset.item;
        delete item.latestMsg;
        delete item.unread;
        delete item.content;
        wx.navigateTo({
            url: `../chat/chat?friend=${JSON.stringify(item)}`
        });
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow () {

        getApp().getIMHandler().setOnReceiveMessageListener({
            listener: (msg) => {
                console.log('会话列表', msg);
                msg.type === 'get-conversations' && this.setData({conversations: msg.conversations.map(item => this.getConversationsItem(item))})
            }
        });
        getApp().getIMHandler().sendMsg({
            content: {
                type: 'get-conversations',
                userId: getApp().globalData.userInfo.userId
            }, success: () => {
                console.log('获取会话列表消息发送成功');
            },
            fail: (res) => {
                console.log('获取会话列表失败', res);
            }
        });
    },
    getConversationsItem(item) {
        let {latestMsg, ...msg} = item;
        return Object.assign(msg, JSON.parse(latestMsg));
    }
});