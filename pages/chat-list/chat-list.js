// pages/chat-list/chat-list.js
import IMOperator from "../chat/im-operator";
import ChatListManager from "./chat-list-manager";

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
    onLoad: function (options) {
        getApp().getIMWebSocket().sendMsg({
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

    toChat: function (e) {
        let item = e.currentTarget.dataset.item;
        delete item.latestMsg;
        delete item.unread;
        wx.navigateTo({
            url: `../chat/chat?friend=${JSON.stringify(item)}`
        });
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        getApp().getIMWebSocket().setOnSocketReceiveMessageListener({
            listener: (msg) => {
                this.setData({conversations: msg.conversations.map(item => ChatListManager.getConversationsItem(item))})
            }
        });
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})