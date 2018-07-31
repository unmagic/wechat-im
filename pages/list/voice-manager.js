import * as chatInput from "../../modules/chat-input/chat-input";
import {isVoiceRecordUseLatestVersion} from "../../modules/chat-input/chat-input";

export default class VoiceManager {
    constructor(page) {
        this._page = page;
        this.isLatestVersion = isVoiceRecordUseLatestVersion();
        if (this.isLatestVersion) {
            this.innerAudioContext = wx.createInnerAudioContext();
        }
    }

    playVoice({filePath, success, fail}) {
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
        if (dataset.isSend || that.data.isAndroid) {
            this.playVoice({
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
                    this.playVoice({
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