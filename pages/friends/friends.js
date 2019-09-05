// pages/friends/friends.js

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
    async onShow() {
        getApp().getIMHandler().setOnReceiveMessageListener({
            listener: (msg) => {
                if (msg.type === 'get-friends') {
                    this.setData({friends: msg.friends.map(item => this.createFriendItem(item))});
                }
            }
        });

        try {
            await getApp().getIMHandler().sendMsg({
                content: {
                    type: 'get-friends',
                    userId: getApp().globalData.userInfo.userId
                }
            });
        } catch (e) {
            console.log('获取好友列表失败', e);
        }
    },

    createFriendItem(item) {
        return {
            friendId: item.userId,
            friendHeadUrl: item.myHeadUrl,
            friendName: item.nickName
        };
    },


});
