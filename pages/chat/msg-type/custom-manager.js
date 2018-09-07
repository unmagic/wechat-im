import IMOperator from "../im-operator";

export default class CustomManager {
    constructor(page) {
        this._page = page;
    }

    /**
     * 接收到消息时，通过UI类的管理进行渲染
     * @param msg 接收到的消息，这个对象应是由 im-operator.js 中的createNormalChatItem()方法生成的。
     */
    showMsg({msg}) {
        //UI类是用于管理UI展示的类。
        this._page.UI.updateViewWhenReceive(msg);
        this._page.UI.updateChatStatus('会话已关闭', false);
    }

    /**
     * 发送消息时，通过UI类来管理发送状态的切换和消息的渲染
     */
    sendOneMsg() {
        const temp = IMOperator.createCustomChatItem();
        this._page.UI.showItemForMoment(temp, (itemIndex) => {
            this._page.sendMsg({
                content: this._page.imOperator.createChatItemContent({
                    type: IMOperator.CustomType,
                    content: temp.content
                }), itemIndex
            });
            this._page.UI.updateChatStatus('会话已关闭', false);
        });
    }
}