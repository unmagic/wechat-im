// pages/list/list.js
import * as chatInput from "../../modules/chat-input/chat-input";
import {saveFileRule} from "../../utils/file";
import * as toast from "../../utils/toast";
import IMOperator from "./im-operator";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        textMessage: '',
        chatItems: [],
        showPageStatus: true,
        my: {},
        other: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.initData();
        wx.setNavigationBarTitle({
            title: '呵呵哒的好朋友'
        });
        this.imOperator = new IMOperator();
        this.data.chatItems.push();

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
        chatInput.setTextMessageListener((e) => {
            let content = e.detail.value;
            const temp = this.imOperator.createChatItem(IMOperator.TextType, this.imOperator.createChatItemContent({
                type: IMOperator.TextType,
                content
            }));

            this.showItemForMoment(temp, (itemIndex) => {
                this.sendMsg(content, itemIndex);
            });
        });
    },
    voiceButton: function () {
        chatInput.recordVoiceListener((res, duration) => {
            let tempFilePath = res.tempFilePath;
            console.log(tempFilePath, duration);
            saveFileRule(tempFilePath, (savedFilePath) => {
                const temp = this.imOperator.createChatItem(IMOperator.TextType, this.imOperator.createChatItemContent({
                    type: IMOperator.VoiceType,
                    content: savedFilePath,
                    duration
                }));
                this.showItemForMoment(temp, (itemIndex) => {
                    this.simulateUploadFile({savedFilePath, duration, itemIndex}, (content) => {
                        this.sendMsg(content, itemIndex);
                    });
                });
            });

        });
        chatInput.setVoiceRecordStatusListener(function (status) {
            if (this.data.isVoicePlaying) {
                let that = this;
                wx.stopVoice();
                that.data.chatItems.forEach(item => {
                    if ('voice' === item.itemType) {
                        item.isPlaying = false
                    }
                });
                that.setData({
                    chatItems: that.data.chatItems,
                    isVoicePlaying: false
                })
            }
        })
    },
    //模拟上传文件
    simulateUploadFile: function ({savedFilePath, duration, itemIndex}, cbOk) {
        setTimeout(() => {
            cbOk && cbOk('http://xxxxxx/xx.com/image/' + savedFilePath);
        }, 2000);
    },
    extraButton: function () {
        let that = this;
        chatInput.clickExtraListener((e) => {
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
                success: (res) => {
                    saveFileRule(res.tempFilePaths[0], (savedFilePath) => {
                        const temp = this.imOperator.createChatItem(IMOperator.TextType, this.imOperator.createChatItemContent({
                            type: IMOperator.ImageType,
                            content: savedFilePath
                        }));
                        that.showItemForMoment(temp, (itemIndex) => {
                            this.simulateUploadFile({savedFilePath, itemIndex}, (content) => {
                                this.sendMsg(content, itemIndex);
                            });
                        });
                    });

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

    showItemForMoment: function (sendMsg, cbOk) {
        if (!sendMsg) return;
        this.updateDataWhenStartSending(sendMsg);
        cbOk && cbOk(this.data.chatItems.length - 1);
    },
    sendMsg: function (content, itemIndex) {
        this.imOperator.onSimulateSendMsg(content, (content) => {
            this.updateViewWhenSendSuccess(content, itemIndex);
        }, () => {
            this.updateViewWhenSendFailed(itemIndex);
        })
    },
    resendMsgEvent: function (e) {
        const itemIndex = parseInt(e.currentTarget.dataset.resendIndex);
        const item = this.data.chatItems[itemIndex];
        this.updateDataWhenStartSending(item, false);
        this.sendMsg(item.content, itemIndex);
    },
    updateDataWhenStartSending: function (sendMsg, addToArr = true) {
        chatInput.closeExtraView();
        sendMsg.sendStatus = 'sending';
        addToArr && this.data.chatItems.push(sendMsg);
        let updateViewData = {
            textMessage: "",
            chatItems: this.data.chatItems,
            scrollTopVal: this.data.scrollTopVal + 999,
        };
        this.setData(updateViewData);
    },
    updateViewWhenSendSuccess: function (sendMsg, itemIndex) {
        let that = this;
        let item = that.data.chatItems[itemIndex];
        item.timeStamp = sendMsg.timeStamp;
        this.updateSendStatusView('success', itemIndex);

    },
    updateViewWhenSendFailed: function (itemIndex) {
        this.updateSendStatusView('failed', itemIndex);
    },
    updateSendStatusView: function (status, itemIndex) {
        let that = this;
        that.data.chatItems[itemIndex].sendStatus = status;
        let obj = {};
        obj[`chatItems[${itemIndex}].sendStatus`] = status;
        obj['scrollTopVal'] = that.data.scrollTopVal + 999;
        that.setData(obj);
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

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

});