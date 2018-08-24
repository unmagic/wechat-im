// chat.js
import Toast from "../../utils/toast";

let chatInput = require('../../modules/chat-input/chat-input');
/**
 * 聊天输入组件展示页面
 */
Page({

    /**
     * 页面的初始数据
     */
    data: {
        textMessage: '',
        chatItems: [],
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
            format: 'mp3',//aac/mp3
            sendButtonBgColor: 'mediumseagreen',
            sendButtonTextColor: 'white',
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
            console.log(content);
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
                case chatInput.VRStatus.START://开始录音

                    break;
                case chatInput.VRStatus.SUCCESS://录音成功

                    break;
                case chatInput.VRStatus.CANCEL://取消录音

                    break;
                case chatInput.VRStatus.SHORT://录音时长太短

                    break;
                case chatInput.VRStatus.UNAUTH://未授权录音功能

                    break;
                case chatInput.VRStatus.FAIL://录音失败(已经授权了)

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
        chatInput.setExtraButtonClickListener(function (dismiss) {
            console.log('Extra弹窗是否消失', dismiss);
        })
    },
    myFun: function () {
        wx.showModal({
            title: '小贴士',
            content: '这是用于拓展的自定义功能！',
            confirmText: '确认',
            showCancel: true,
            success: function (res) {
                if (res.confirm) {
                    Toast.show('success', '自定义功能')
                }
            }
        })
    },

    resetInputStatus: function () {
        chatInput.closeExtraView();
    },
});