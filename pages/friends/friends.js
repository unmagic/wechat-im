// pages/friends/friends.js
import ChatListManager from "../chat-list/chat-list-manager";

/**
 * 获取好友列表
 */
Page({

    /**
     * 页面的初始数据
     */
    data: {
        friends: []
    },
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
                if (msg.type === 'get-friends') {
                    this.setData({friends: msg.friends.map(item => this.createFriendItem(item))});
                }
            }
        });
    },

    createFriendItem(item) {
        return {
            friendId: item.userId,
            friendHeadUrl: item.myHeadUrl,
            friendName: item.nickName
        };
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

});