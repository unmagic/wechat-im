import * as chatInput from "../../modules/chat-input/chat-input";

/**
 * 用户处理消息的收发UI更新
 */
export default class UI {
    constructor(page) {
        this._page = page;
    }

    /**
     * 接收到消息时，更新UI
     * @param msg
     */
    updateViewWhenReceive(msg) {
        this._page.data.chatItems.push(msg);
        this._page.setData({
            chatItems: this._page.data.chatItems.sort(this._sortMsgsByTimestamp),
            scrollTopVal: this._page.data.scrollTopVal + 999,
        });
    }

    /**
     * 发送消息时，渲染消息的发送状态为 发送中
     * @param sendMsg
     * @param cbOk
     */
    showItemForMoment(sendMsg, cbOk) {
        if (!sendMsg) return;
        this.updateDataWhenStartSending(sendMsg);
        cbOk && cbOk(this._page.data.chatItems.length - 1);
    }

    /**
     * 设置消息发送状态为 发送中
     * @param sendMsg
     * @param addToArr
     */
    updateDataWhenStartSending(sendMsg, addToArr = true) {
        chatInput.closeExtraView();
        sendMsg.sendStatus = 'sending';
        addToArr && this._page.data.chatItems.push(sendMsg);
        this._page.setData({
            textMessage: "",
            chatItems: this._page.data.chatItems.sort(this._sortMsgsByTimestamp),
            scrollTopVal: this._page.data.scrollTopVal + 999,
        });
    }

    /**
     * 设置消息发送状态为 发送成功
     * @param sendMsg
     * @param itemIndex
     */
    updateViewWhenSendSuccess(sendMsg, itemIndex) {
        console.log('发送成功', sendMsg);
        let that = this._page;
        let item = that.data.chatItems[itemIndex];
        item.timeStamp = sendMsg.timeStamp;
        this.updateSendStatusView('success', itemIndex);

    }

    /**
     * 设置消息发送状态为 发送失败
     * @param itemIndex
     */
    updateViewWhenSendFailed(itemIndex) {
        this.updateSendStatusView('failed', itemIndex);
    }

    updateSendStatusView(status, itemIndex) {
        let that = this._page;
        that.data.chatItems[itemIndex].sendStatus = status;
        let obj = {};
        obj[`chatItems[${itemIndex}].sendStatus`] = status;
        obj['scrollTopVal'] = that.data.scrollTopVal + 999;
        that.setData(obj);
    }

    updateChatStatus(content, open = true) {
        this._page.setData({
            chatStatue: open ? 'open' : 'close',
            chatStatusContent: content
        })
    }

    _sortMsgsByTimestamp(timestamp1, timestamp2) {
        return timestamp2 - timestamp1;
    }
}
