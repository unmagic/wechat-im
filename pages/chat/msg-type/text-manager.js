export default class TextManager {
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
    }

    /**
     * 发送消息时，通过UI类来管理发送状态的切换和消息的渲染
     * @param content 输入组件获取到的原始文本信息
     * @param type
     */
    sendOneMsg({content, type}) {
        this._page.UI.showItemForMoment(this._page.imOperator.createNormalChatItem({
            type,
            content
        }), (itemIndex) => {
            this._page.sendMsg({
                content: this._page.imOperator.createChatItemContent({type, content}),
                itemIndex
            });
        });
    }

    resend({type, content, duration, itemIndex}) {
        this._page.sendMsg({
            content: this._page.imOperator.createChatItemContent({
                type: item.type,
                content: item.content,
                duration: item.voiceDuration
            }),
            itemIndex,
            success: (msg) => {
                this._page.UI.updateListViewBySort();
            }
        });
    }
}