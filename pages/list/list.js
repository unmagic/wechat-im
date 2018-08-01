// pages/list/list.js
import * as chatInput from "../../modules/chat-input/chat-input";
import {saveFileRule} from "../../utils/file";
import IMOperator from "./im-operator";
import VoiceManager from "./voice-manager";
import UI from "./ui";
import TextManager from "./text-manager";
import ImageManager from "./image-manager";

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
        this.imageManager = new ImageManager(this);

        this.imOperator.onSimulateReceiveMsg((msg) => {
            let tempManager = null;
            switch (msg.type) {
                case IMOperator.VoiceType:
                    tempManager = this.voiceManager;
                    break;
                case IMOperator.ImageType:
                    tempManager = this.imageManager;
                    break;
                case IMOperator.TextType:
                case IMOperator.CustomType:
                    tempManager = this.textManager;
            }
            tempManager.showMsg({msg});
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
            this.voiceManager._stopAllVoicePlay();
        })
    },

    //模拟上传文件，注意这里的cbOk回调函数传入的参数应该是上传文件成功时返回的文件url，这里因为模拟，我直接用的savedFilePath
    simulateUploadFile: function ({savedFilePath, duration, itemIndex}, cbOk) {
        setTimeout(() => {
            let urlFromServerWhenUploadSuccess = savedFilePath;
            cbOk && cbOk(urlFromServerWhenUploadSuccess);
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
            this.imageManager.sendImage({itemIndex})

        });
    },
    /**
     * 自定义事件
     */
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

    sendMsg: function (content, itemIndex, cbOk) {
        this.imOperator.onSimulateSendMsg({
            content,
            success: (msg) => {
                this.UI.updateViewWhenSendSuccess(msg, itemIndex);
                cbOk && cbOk(msg.content);
            },
            fail: () => {
                this.UI.updateViewWhenSendFailed(itemIndex);
            }
        })
    },
    /**
     * 重发消息
     * @param e
     */
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