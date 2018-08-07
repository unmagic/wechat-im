import {saveFileRule} from "../../../utils/file";
import IMOperator from "../im-operator";
import FileManager from "../file-manager";

export default class ImageManager {
    constructor(page) {
        this._page = page;
        this._page.imageClickEvent = function (e) {
            wx.previewImage({
                current: e.currentTarget.dataset.url, // 当前显示图片的http链接
                urls: [e.currentTarget.dataset.url] // 需要预览的图片http链接列表
            })
        }
    }

    sendOneMsg(tempFilePath) {
        saveFileRule(tempFilePath, (savedFilePath) => {
            const temp = this._page.imOperator.createNormalChatItem({
                type: IMOperator.ImageType,
                content: savedFilePath
            });
            this._page.UI.showItemForMoment(temp, (itemIndex) => {
                this._page.simulateUploadFile({savedFilePath, itemIndex}, (content) => {
                    this._page.sendMsg(this._page.imOperator.createChatItemContent({
                        type: IMOperator.ImageType,
                        content
                    }), itemIndex, (msg) => {
                        FileManager.set(msg, savedFilePath)
                    });
                });
            });
        });
    }

    /**
     * 接收到消息时，通过UI类的管理进行渲染
     * @param msg 接收到的消息，这个对象应是由 im-operator.js 中的createNormalChatItem()方法生成的。
     */
    showMsg({msg}) {
        const url = msg.content;
        const localImagePath = FileManager.get(msg);
        console.log('本地图片路径', localImagePath);
        if (!localImagePath) {
            wx.downloadFile({
                url,
                success: res => {
                    saveFileRule(res.tempFilePath, (savedFilePath) => {
                        const temp = this._page.imOperator.createNormalChatItem({
                            type: IMOperator.ImageType,
                            content: savedFilePath
                        });
                        this._page.UI.updateViewWhenReceive(temp);
                        //以消息的content为key，建立消息和本地存储路径的映射关系
                        FileManager.set(msg, savedFilePath);
                    });
                }
            });
        } else {
            this._page.UI.updateViewWhenReceive(msg);
        }
    }

}