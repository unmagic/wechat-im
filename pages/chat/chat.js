// chat.js
let toast = require('../../utils/toast.js');
let chatInput = require('../../modules/chat-input/chat-input');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        friendHeadUrl: '',
        textMessage: '',
        chatItems: [],
        scrollTopTimeStamp: 0,
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.initData();
    },
    initData: function () {
        let that = this;
        let systemInfo = wx.getSystemInfoSync();
        chatInput.init(this, {
            systemInfo: systemInfo,
            minVoiceTime: 1,
            maxVoiceTime: 60,
            startTimeDown: 56,
            extraArr: [{
                picName: 'choose_picture',
                description: '照片'
            }, {
                picName: 'take_photos',
                description: '拍摄'
            }, {
                picName: 'close_chat',
                description: '自定义功能'
            }],
            // tabbarHeigth: 48
        });

        that.setData({
            pageHeight: systemInfo.windowHeight,
        });
        wx.setNavigationBarTitle({
            title: '好友'
        });
        that.textButton();
        that.extraButton();
        that.voiceButton();
    },
    textButton: function () {
        chatInput.setTextMessageListener(function (e) {
            let content = e.detail.value;
        });
    },
    voiceButton: function () {
        chatInput.recordVoiceListener(function (res, duration) {
            let tempFilePath = res.tempFilePath;
            let vDuration = duration;
            console.log(tempFilePath, vDuration);
        });
        chatInput.setVoiceRecordStatusListener(function (status) {
            switch (status) {
                case 1://开始录音
                    console.log('开始录音');
                    break;
                case 0://结束录音
                    console.log('结束录音');
                    break;

            }
        })
    },
    extraButton: function () {
        let that = this;
        chatInput.clickExtraListener(function (e) {
            console.log(e);
            let itemIndex = parseInt(e.currentTarget.dataset.index);
            if (itemIndex === 2) {
                that.myFun();
                return;
            }
            wx.chooseImage({
                count: 1, // 默认9
                sizeType: ['compressed'],
                sourceType: itemIndex === 0 ? ['album'] : ['camera'],
                success: function (res) {
                    let tempFilePath = res.tempFilePaths[0];
                }
            });
        });
    },
    myFun: function () {
        wx.showModal({
            title: '小贴士',
            content: '这是用于拓展的自定义功能！',
            confirmText: '确认',
            showCancel: true,
            success: function (res) {
                if (res.confirm) {
                    toast.show('success', '自定义功能')
                }
            }
        })
    },

    resetInputStatus: function () {
        chatInput.closeExtraView();
    },
});