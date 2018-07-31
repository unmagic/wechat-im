// pages/list/list.js
import * as chatInput from "../../modules/chat-input/chat-input";
import {saveFileRule} from "../../utils/file";
import IMOperator from "./im-operator";
import VoiceManager from "./voice-manager";
import UI from "./ui";
import TextManager from "./text-manager";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        textMessage: '',
        chatItems: [],
        my: {},
        other: {},
        latestPlayVoicePath: '',
        isAndroid: true,
        chatStatue: 'open'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.initData();
        wx.setNavigationBarTitle({
            title: '呵呵哒的好朋友'
        });
        this.imOperator = new IMOperator(this);
        this.UI = new UI(this);
        this.voiceManager = new VoiceManager(this);
        this.textManager = new TextManager(this);
        this.imOperator.onSimulateReceiveMsg((msg) => {
            this.data.chatItems.push(msg);
            this.setData({
                chatItems: this.data.chatItems,
                scrollTopVal: this.data.scrollTopVal + 999,
            });
        });
        this.UI.updateChatStatus('正在聊天中...');
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
            isAndroid: systemInfo.system.indexOf("Android") !== -1,
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
            this.textManager.sendText({content});
        });
    },
    voiceButton: function () {
        chatInput.recordVoiceListener((res, duration) => {
            let tempFilePath = res.tempFilePath;
            this.voiceManager.sendVoice({tempFilePath, duration});
        });
        chatInput.setVoiceRecordStatusListener((status) => {
            if (this.data.isVoicePlaying) {
                let that = this;
                this.voiceManager.stopVoice();
                that.data.chatItems.forEach(item => {
                    if ('voice' === item.type) {
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
            cbOk && cbOk(savedFilePath);
        }, 1000);
    },
    extraButton: function () {
        let that = this;
        chatInput.clickExtraListener((e) => {
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
                        const temp = this.imOperator.createNormalChatItem({
                            type: IMOperator.ImageType,
                            content: savedFilePath
                        });
                        that.showItemForMoment(temp, (itemIndex) => {
                            this.simulateUploadFile({savedFilePath, itemIndex}, (content) => {
                                this.sendMsg(IMOperator.createChatItemContent({
                                    type: IMOperator.ImageType,
                                    content
                                }), itemIndex);
                            });
                        });
                    });

                }
            });
        });
    },
    chatVoiceItemClickEvent: function (e) {
        let dataset = e.currentTarget.dataset;
        console.log('语音Item', dataset);
        this.voiceManager.playVoice({dataset})
    },


    imageClickEvent: function (e) {
        wx.previewImage({
            current: e.currentTarget.dataset.url, // 当前显示图片的http链接
            urls: [e.currentTarget.dataset.url] // 需要预览的图片http链接列表
        })
    },
    myFun: function () {
        wx.showModal({
            title: '小贴士',
            content: '演示更新会话状态',
            confirmText: '确认',
            showCancel: true,
            success: (res) => {
                if (res.confirm) {
                    const temp = IMOperator.createCustomChatItem();
                    this.UI.showItemForMoment(temp, (itemIndex) => {
                        this.sendMsg(IMOperator.createChatItemContent({
                            type: IMOperator.CustomType,
                            content: temp.content
                        }), itemIndex);
                        this.UI.updateChatStatus('会话已关闭', false);
                    });
                }
            }
        })
    },

    resetInputStatus: function () {
        chatInput.closeExtraView();
    },

    sendMsg: function (content, itemIndex) {
        this.imOperator.onSimulateSendMsg(content, (msg) => {
            this.UI.updateViewWhenSendSuccess(msg, itemIndex);
        }, () => {
            this.UI.updateViewWhenSendFailed(itemIndex);
        })
    },
    resendMsgEvent: function (e) {
        const itemIndex = parseInt(e.currentTarget.dataset.resendIndex);
        const item = this.data.chatItems[itemIndex];
        this.UI.updateDataWhenStartSending(item, false);
        this.sendMsg(IMOperator.createChatItemContent({
            type: item.type,
            content: item.content,
            duration: item.voiceDuration
        }), itemIndex);
    },
});