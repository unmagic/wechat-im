import IMOperator from "./im-operator";
import MsgTypeManager from "./msg-type/base/msg-type-manager";

export default class MsgManager extends MsgTypeManager {
    constructor(page) {
        super(page);
    }

    showMsg({msg}) {
        this.getMsgManager({type: msg.type}).showMsg({msg});
    }

    sendMsg({type = IMOperator.TextType, content, duration}) {
        this.getMsgManager({type}).sendOneMsg(arguments[0]);
    }

    stopAllVoice() {
        this.voiceManager.stopAllVoicePlay();
    }
}