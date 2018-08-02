import VoiceManager from "./msg-type/voice-manager";
import TextManager from "./msg-type/text-manager";
import ImageManager from "./msg-type/image-manager";
import IMOperator from "./im-operator";

export default class MsgManager {
    constructor(page) {
        this._page = page;
        this.voiceManager = new VoiceManager(this._page);
        this.textManager = new TextManager(this._page);
        this.imageManager = new ImageManager(this._page);
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

    sendMsg({}) {

    }
}