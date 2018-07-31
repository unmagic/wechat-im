export default class VoiceManager {
    constructor(isLatestVersion) {
        this.isLatestVersion = isLatestVersion;
        if (this.isLatestVersion) {
            this.innerAudioContext = wx.createInnerAudioContext();
        }
    }

    playVoice({filePath, success, fail}) {
        if (this.isLatestVersion) {
            this.innerAudioContext.src = filePath;
            this.innerAudioContext.startTime = 0;
            this.innerAudioContext.play();
            this.innerAudioContext.onError((error)=>{
                this.innerAudioContext.offError();
                fail && fail(error);
            });
            this.innerAudioContext.onEnded(()=>{
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

}