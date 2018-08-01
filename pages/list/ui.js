import * as chatInput from "../../modules/chat-input/chat-input";

export default class UI {
    constructor(page) {
        this._page = page;
    }

    updateViewWhenReceive(msg) {
        this._page.data.chatItems.push(msg);
        this._page.setData({
            chatItems: this._page.data.chatItems,
            scrollTopVal: this._page.data.scrollTopVal + 999,
        });
    }

    showItemForMoment(sendMsg, cbOk) {
        if (!sendMsg) return;
        this.updateDataWhenStartSending(sendMsg);
        cbOk && cbOk(this._page.data.chatItems.length - 1);
    }

    updateDataWhenStartSending(sendMsg, addToArr = true) {
        chatInput.closeExtraView();
        sendMsg.sendStatus = 'sending';
        addToArr && this._page.data.chatItems.push(sendMsg);
        this._page.setData({
            textMessage: "",
            chatItems: this._page.data.chatItems,
            scrollTopVal: this._page.data.scrollTopVal + 999,
        });
    }

    updateViewWhenSendSuccess(sendMsg, itemIndex) {
        console.log('发送成功', sendMsg);
        let that = this._page;
        let item = that.data.chatItems[itemIndex];
        item.timeStamp = sendMsg.timeStamp;
        this.updateSendStatusView('success', itemIndex);

    }

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
}
