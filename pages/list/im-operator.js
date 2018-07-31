import {dealChatTime} from "../../utils/time";

export default class IMOperator {
    static VoiceType = 'voice';
    static TextType = 'text';
    static ImageType = 'image';
    static CustomType = 'custom';

    constructor(page) {
        this._page = page;
        this._latestTImestamp = 0;
        this._myHeadUrl = '../../image/my_head.jpeg';
        this._otherHeadUrl = '../../image/other_head.jpg';
    }


    onSimulateReceiveMsg(cbOk) {
        this.onSimulateReceiveMsgCb = cbOk;
    }

    onSimulateSendMsg(content, cbOk, cbError) {
        //这里content即为要发送的数据
        setTimeout(() => {
            const item = this.createNormalChatItem(JSON.parse(content));
            this._latestTImestamp = item.timestamp;

            //使用随机数来模拟数据发送失败情况
            const isSendSuccess = parseInt(Math.random() * 100) > 35;
            console.log('随机数模拟是否发送成功', isSendSuccess);
            const isChatClose = this._page.data.chatStatue === 'close';
            if (isSendSuccess || isChatClose) {
                cbOk && cbOk(item);
            } else {
                cbError && cbError();
            }
            if (isChatClose || !isSendSuccess) return;
            setTimeout(() => {
                const item = this.createNormalChatItem({type: 'text', content: '我是自动回复的好友文本消息', isMy: false});
                this._latestTImestamp = item.timestamp;
                this.onSimulateReceiveMsgCb && this.onSimulateReceiveMsgCb(item);
            }, 1000);
        }, 300);

    }

    static createChatItemContent({type = IMOperator.TextType, content = '', duration} = {}) {
        if (!content.replace(/^\s*|\s*$/g, '')) return;
        return JSON.stringify({content, type, duration});
    }

    createNormalChatItem({type = IMOperator.TextType, content = '', isMy = true, duration} = {}) {
        if (!content) return;
        const currentTimestamp = Date.now();
        const time = dealChatTime(currentTimestamp, this._latestTImestamp);
        return {
            isMy: isMy,
            showTime: time.ifShowTime,//是否显示该次发送时间
            time: time.timeStr,//发送时间 如 09:15,
            timestamp: currentTimestamp,//该条数据的时间戳，一般用于排序
            type: type,//内容的类型，目前有这几种类型： text/voice/image/custom | 文本/语音/图片/自定义
            content: content,// 显示的内容，根据不同的类型，在这里填充不同的信息。
            headUrl: isMy ? this._myHeadUrl : this._otherHeadUrl,//显示的头像，你可以填充不同的头像，来满足群聊的需求
            sendStatus: 'success',//发送状态，目前有这几种状态：sending/success/failed | 发送中/发送成功/发送失败
            voiceDuration: duration,//语音时长 单位秒
            isPlaying: false//语音是否正在播放
        };

    }

    static createCustomChatItem() {
        return {
            timestamp: Date.now(),
            type: IMOperator.CustomType,
            content: '会话已关闭'
        }
    }

}

