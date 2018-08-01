import {saveFileRule} from "../../utils/file";
import IMOperator from "./im-operator";
import ChatConfig from "./config";
import FileManager from "./file-manager";

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

    sendImage({itemIndex}) {
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['compressed'],
            sourceType: itemIndex === 0 ? ['album'] : ['camera'],
            success: (res) => {
                saveFileRule(res.tempFilePaths[0], (savedFilePath) => {
                    const temp = this._page.imOperator.createNormalChatItem({
                        type: IMOperator.ImageType,
                        content: savedFilePath
                    });
                    this._page.UI.showItemForMoment(temp, (itemIndex) => {
                        this._page.simulateUploadFile({savedFilePath, itemIndex}, (content) => {
                            this._page.sendMsg(IMOperator.createChatItemContent({
                                type: IMOperator.ImageType,
                                content
                            }), itemIndex);
                        });
                    });
                });
            }
        });
    }

    showMsg(msg) {
        const url = msg.content;
        const localImagePath = FileManager.get(url);
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
                        FileManager.set({msgPath: url, localPath: savedFilePath});
                    });
                }
            });
        } else {
            this._page.UI.updateViewWhenReceive(msg);
        }
    }

}