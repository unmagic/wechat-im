// pages/list/list.js
import * as chatInput from "../../modules/chat-input/chat-input";
import {saveFileRule} from "../../utils/file";
import * as toast from "../../utils/toast";
import IMOperator from "./im-operator";
import VoiceManager from "./voice-manager";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        textMessage: '',
        chatItems: [],
        showPageStatus: true,
        my: {},
        other: {},
        latestPlayVoicePath: '',
        isAndroid: true
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
        this.voiceManager = new VoiceManager(chatInput.isVoiceRecordUseLatestVersion());
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
            console.log('刚刚开始', content);
            this.showItemForMoment(this.imOperator.createNormalChatItem({
                type: IMOperator.TextType,
                content
            }), (itemIndex) => {
                this.sendMsg(IMOperator.createChatItemContent({type: IMOperator.TextType, content}), itemIndex);
            });
        });
    },
    voiceButton: function () {
        chatInput.recordVoiceListener((res, duration) => {
            let tempFilePath = res.tempFilePath;
            console.log(tempFilePath, duration);
            saveFileRule(tempFilePath, (savedFilePath) => {
                const temp = this.imOperator.createNormalChatItem({
                    type: IMOperator.VoiceType,
                    content: savedFilePath,
                    duration
                });
                this.showItemForMoment(temp, (itemIndex) => {
                    this.simulateUploadFile({savedFilePath, duration, itemIndex}, (content) => {
                        this.sendMsg(IMOperator.createChatItemContent({
                            type: IMOperator.VoiceType,
                            content: content,
                            duration
                        }), itemIndex);
                    });
                });
            });

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
        let that = this;

        if (dataset.voicePath === this.data.latestPlayVoicePath && that.data.chatItems[dataset.index].isPlaying) {
            that.stopAllVoicePlay();
        } else {
            that.startPlayVoice(dataset);
            let localPath = dataset.voicePath;//优先读取本地路径，可能不存在此文件

            that.myPlayVoice(localPath, dataset, function () {
                console.log('成功读取了本地语音');
            }, () => {
                wx.downloadFile({
                    url: dataset.voicePath,
                    success: res => {
                        console.log('下载语音成功', res);
                        this.voiceManager.playVoice({
                            filePath: res.tempFilePath,
                            success: () => {
                                that.stopAllVoicePlay();
                            },
                            fail: (res) => {
                                console.log('播放失败了', res);
                            }
                        });
                    }
                });
            });
        }
    },
    myPlayVoice: function (filePath, dataset, cbOk, cbError) {
        let that = this;
        if (dataset.isSend || that.data.isAndroid) {
            this.voiceManager.playVoice({
                filePath: filePath,
                success: () => {
                    that.stopAllVoicePlay();
                    typeof cbOk === "function" && cbOk();
                },
                fail: (res) => {
                    console.log('播放失败了1', res);
                    typeof cbError === "function" && cbError(res);
                }
            });
        } else {
            wx.downloadFile({
                url: dataset.voicePath,
                success: res => {
                    console.log('下载语音成功', res);
                    this.voiceManager.playVoice({
                        filePath: res.tempFilePath,
                        success: () => {
                            that.stopAllVoicePlay();
                            typeof cbOk === "function" && cbOk();
                        },
                        fail: (res) => {
                            console.log('播放失败了', res);
                            typeof cbError === "function" && cbError(res);
                        }
                    });
                }
            });
        }

    },
    startPlayVoice: function (dataset) {
        let that = this;
        let chatItems = that.data.chatItems;
        chatItems[dataset.index].isPlaying = true;
        if (that.data.latestPlayVoicePath && that.data.latestPlayVoicePath !== chatItems[dataset.index].content) {//如果重复点击同一个，则不将该isPlaying置为false
            for (let i = 0, len = chatItems.length; i < len; i++) {
                if ('voice' === chatItems[i].type && that.data.latestPlayVoicePath === chatItems[i].content) {
                    chatItems[i].isPlaying = false;
                    break;
                }
            }
        }
        that.setData({
            chatItems: chatItems,
            isVoicePlaying: true
        });
        that.data.latestPlayVoicePath = dataset.voicePath;
    },
    stopAllVoicePlay: function () {
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
            content: '这是用于拓展的自定义功能！',
            confirmText: '确认',
            showCancel: true,
            success: (res) => {
                if (res.confirm) {
                    const temp = IMOperator.createCustomChatItem();
                    this.showItemForMoment(temp, (itemIndex) => {
                        this.sendMsg(IMOperator.createChatItemContent({
                            type: IMOperator.CustomType,
                            content: temp.content
                        }), itemIndex)
                    });
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
        console.log('即将发送', content);
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
        console.log('发送成功', sendMsg);
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