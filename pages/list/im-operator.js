export default class IMOperator {
    static VoiceType = 'voice';
    static TextType = 'text';
    static ImageType = 'image';
    static CustomType = 'custom';

    constructor() {
        this._latestTImestamp = 0;
        this._myHeadUrl = '../../image/my_head.jpeg'
    }


    onSimulateReceiveMsg(cbOk) {

    }

    onSimulateSendMsg(content, cbOk, cbError) {
        //这里content即为要发送的数据
        setTimeout(() => {
            const item = this.createNormalChatItem(JSON.parse(content));
            this._latestTImestamp = item.timestamp;
            cbOk && cbOk(item);
        }, 300)
    }

    static createChatItemContent({type = IMOperator.TextType, content = '', duration} = {}) {
        if (!content.replace(/^\s*|\s*$/g, '')) return;
        return JSON.stringify({content, type, duration});
    }

    createDefaultChaItem() {

    }

    createNormalChatItem({type = IMOperator.TextType, content = '', duration} = {}) {
        return {
            isMy: true,
            showTime: true,//是否显示该次发送时间
            time: '09:15',//发送时间 如 09:15,
            timestamp: Date.now(),//该条数据的时间戳，一般用于排序
            type: type,//内容的类型，目前有这几种类型： text/voice/image/custom | 文本/语音/图片/自定义
            content: content,// 显示的内容，根据不同的类型，在这里填充不同的信息。
            headUrl: this._myHeadUrl,//显示的头像，你可以填充不同的头像，来满足群聊的需求
            sendStatus: 'success',//发送状态，目前有这几种状态：sending/success/failed | 发送中/发送成功/发送失败
            voiceDuration: duration,//语音时长 单位秒
            isPlaying: false//语音是否正在播放
        };

    }

    static createCustomChatItem() {
        return {
            timestamp: Date.now(),
            type: IMOperator.CustomType,
            content: '这是用于拓展的自定义功能'
        }
    }

    getChatItem() {

    }
}

