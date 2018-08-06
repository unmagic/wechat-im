// pages/friends/friends.js
import ChatListManager from "../chat-list/chat-list-manager";

/**
 * 获取好友列表
 */
Page({

    /**
     * 页面的初始数据
     */
    data: {},
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        getApp().getIMWebSocket().sendMsg({
            content: {
                type: 'get-friends',
                userId: getApp().globalData.userInfo.userId
            }, fail: (res) => {
                console.log('获取好友列表失败', res);
            }
        });
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