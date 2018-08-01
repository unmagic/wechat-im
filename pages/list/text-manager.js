import IMOperator from "./im-operator";

export default class TextManager {
    constructor(page) {
        this._page = page;
    }

    showMsg({msg}) {
        this._page.UI.updateViewWhenReceive(msg);
    }

    sendText({content}) {
        this._page.UI.showItemForMoment(this._page.imOperator.createNormalChatItem({
            type: IMOperator.TextType,
            content
        }), (itemIndex) => {
            this._page.sendMsg(IMOperator.createChatItemContent({type: IMOperator.TextType, content}), itemIndex);
        });
    }
}