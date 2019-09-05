import FileSaveManager from "../../file-save-manager";
import {downloadFile} from "../../../../utils/tools";

export default class FileManager {

    constructor(page) {
        this._page = page;
    }

    /**
     * 接收到消息时，通过UI类的管理进行渲染
     * @param msg 接收到的消息，这个对象应是由 im-operator.js 中的createNormalChatItem()方法生成的。
     */
    async showMsg({msg}) {
        const url = msg.content;
        const localFilePath = FileSaveManager.get(msg);
        if (!localFilePath) {
            try {
                const {tempFilePath} = await downloadFile({url});
                const {savedFilePath} = await FileSaveManager.saveFileRule({tempFilePath});
                msg.content = savedFilePath;
                this._page.UI && this._page.UI.updateViewWhenReceive(msg);
                FileSaveManager.set(msg, savedFilePath);
            } catch (e) {
                console.warn('文件类型消息下载或存储失败，将使用网络url访问该文件', e);
                this._page.UI && this._page.UI.updateViewWhenReceive(msg);
            }
        } else {
            msg.content = localFilePath;
            this._page.UI.updateViewWhenReceive(msg);
        }
    }

    /**
     * 发送文件类型消息
     * @param type 消息类型
     * @param content 由输入组件接收到的临时文件路径
     * @param duration 由输入组件接收到的录音时间
     */
    async sendOneMsg({type, content, duration}) {
        try {
            const {savedFilePath} = await FileSaveManager.saveFileRule({tempFilePath: content});
            await this._sendFileMsg({content: savedFilePath, duration, type});
        } catch (e) {
            await this._sendFileMsg({content, type, duration});
        }


    }

    async _sendFileMsg({content, duration, type}) {
        const temp = this._page.imOperator.createNormalChatItem({
            type,
            content,
            duration
        });
        const {itemIndex} = await this._page.UI.showItemForMoment(temp);
        await this.uploadFileAndSend({content, duration, itemIndex, type})
    }

    async uploadFileAndSend({content, duration, type, itemIndex}) {
        const {url} = await this._page.simulateUploadFile({savedFilePath: content, duration, itemIndex});
        const {msg} = await this._page.sendMsg({
            content: this._page.imOperator.createChatItemContent({type, content: url, duration}),
            itemIndex,
        });
        FileSaveManager.set(msg, content);
    }

    resend({}) {
        //文件的重发在商业版中已经实现，开源版中需要你自行实现
    }
}
