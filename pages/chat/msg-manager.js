import VoiceManager from "./msg-type/voice-manager";
import TextManager from "./msg-type/text-manager";
import ImageManager from "./msg-type/image-manager";
import IMOperator from "./im-operator";
import CustomManager from "./msg-type/custom-manager";

export default class MsgManager {
    constructor(page) {
        this.voiceManager = new VoiceManager(page);
        this.textManager = new TextManager(page);
        this.imageManager = new ImageManager(page);
        this.customManager = new CustomManager(page);
    }

    showMsg({msg}) {
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
    }

    sendMsg({type = IMOperator.TextType, content, duration}) {
        let tempManager = null;
        switch (type) {
            case IMOperator.VoiceType:
                tempManager = this.voiceManager;
                break;
            case IMOperator.ImageType:
                tempManager = this.imageManager;
                break;
            case IMOperator.CustomType:
                tempManager = this.customManager;
                break;
            case IMOperator.TextType:
                tempManager = this.textManager;
        }
        tempManager.sendOneMsg(content, duration);
    }

    stopAllVoice() {
        this.voiceManager.stopAllVoicePlay();
    }
}