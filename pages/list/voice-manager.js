import {isVoiceRecordUseLatestVersion} from "../../modules/chat-input/chat-input";
import {saveFileRule} from "../../utils/file";
import IMOperator from "./im-operator";
import ChatConfig from "./config";

export default class VoiceManager {
    constructor(page) {
        this._page = page;
        this.isLatestVersion = isVoiceRecordUseLatestVersion();
        if (this.isLatestVersion) {
            this.innerAudioContext = wx.createInnerAudioContext();
        }
    }

    sendVoice({tempFilePath, duration}) {
        saveFileRule(tempFilePath, (savedFilePath) => {
            const temp = this._page.imOperator.createNormalChatItem({
                type: IMOperator.VoiceType,
                content: savedFilePath,
                duration
            });
            this._page.UI.showItemForMoment(temp, (itemIndex) => {
                this._page.simulateUploadFile({savedFilePath, duration, itemIndex}, (content) => {
                    this._page.sendMsg(IMOperator.createChatItemContent({
                        type: IMOperator.VoiceType,
                        content: content,
                        duration
                    }), itemIndex);
                });
            });
        });
    }

    playVoice({dataset}) {
        let that = this._page;
        if (dataset.voicePath === that.data.latestPlayVoicePath && that.data.chatItems[dataset.index].isPlaying) {
            this.stopAllVoicePlay();
        } else {
            this.startPlayVoice(dataset);
            let localPath = dataset.voicePath;//优先读取本地路径，可能不存在此文件

            this.myPlayVoice(localPath, dataset, function () {
                console.log('成功读取了本地语音');
            }, () => {
                console.log('读取本地语音文件失败，一般情况下是本地没有该文件，需要从服务器下载');
                wx.downloadFile({
                    url: ChatConfig.MyServerVoiceUrl + dataset.voicePath,
                    success: res => {
                        console.log('下载语音成功', res);
                        this._playVoice({
                            filePath: res.tempFilePath,
                            success: () => {
                                this.stopAllVoicePlay();
                            },
                            fail: (res) => {
                                console.log('播放失败了', res);
                            }
                        });
                    }
                });
            });
        }
    }

    _playVoice({filePath, success, fail}) {
        if (this.isLatestVersion) {
            this.innerAudioContext.src = filePath;
            this.innerAudioContext.startTime = 0;
            this.innerAudioContext.play();
            this.innerAudioContext.onError((error) => {
                this.innerAudioContext.offError();
                fail && fail(error);
            });
            this.innerAudioContext.onEnded(() => {
                this.innerAudioContext.offEnded();
                success && success();
            });
        } else {
            wx.playVoice({filePath, success, fail});
        }
    }

    stopVoice() {
        if (this.isLatestVersion) {
            this.innerAudioContext.stop();
        } else {
            wx.stopVoice();
        }
    }

    myPlayVoice(filePath, dataset, cbOk, cbError) {
        let that = this._page;
        if (dataset.isMy || that.data.isAndroid) {
            this._playVoice({
                filePath: filePath,
                success: () => {
                    this.stopAllVoicePlay();
                    typeof cbOk === "function" && cbOk();
                },
                fail: (res) => {
                    console.log('播放失败了1', res);
                    typeof cbError === "function" && cbError(res);
                }
            });
        } else {
            wx.downloadFile({
                url: ChatConfig.MyServerVoiceUrl + dataset.voicePath,
                success: res => {
                    console.log('下载语音成功', res);
                    this._playVoice({
                        filePath: res.tempFilePath,
                        success: () => {
                            this.stopAllVoicePlay();
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

    }

    startPlayVoice(dataset) {
        let that = this._page;
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
    }

    stopAllVoicePlay() {
        let that = this._page;
        if (this._page.data.isVoicePlaying) {
            this.stopVoice();
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
    }

}