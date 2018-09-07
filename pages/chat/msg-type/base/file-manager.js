import FileSaveManager from "../../file-save-manager";

export default class FileManager {

    constructor(page) {
        this._page = page;
    }

    /**
     * 接收到消息时，通过UI类的管理进行渲染
     * @param msg 接收到的消息，这个对象应是由 im-operator.js 中的createNormalChatItem()方法生成的。
     */
    showMsg({msg}) {
        const url = msg.content;
        const localFilePath = FileSaveManager.get(msg);
        if (!localFilePath) {
            wx.downloadFile({
                url,
                success: res => {
                    // console.log('下载成功', res);
                    FileSaveManager.saveFileRule({
                            tempFilePath: res.tempFilePath,
                            success: (savedFilePath) => {
                                msg.content = savedFilePath;
                                this._page.UI && this._page.UI.updateViewWhenReceive(msg);
                                FileSaveManager.set(msg, savedFilePath);
                            },
                            fail: res => {
                                // console.log('存储失败', res);
                                this._page.UI && this._page.UI.updateViewWhenReceive(msg);
                            }
                        }
                    )
                }
            });
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
    sendOneMsg({type, content, duration}) {
        FileSaveManager.saveFileRule({
            tempFilePath: content,
            success: (savedFilePath) => {
                this._sendFileMsg({content: savedFilePath, duration, type});
            }, fail: res => {
                this._sendFileMsg({content, type, duration});
            }
        });
    }

    _sendFileMsg({content, duration, type}) {
        const temp = this._page.imOperator.createNormalChatItem({
            type,
            content,
            duration
        });
        this._page.UI.showItemForMoment(temp, (itemIndex) => {
            this.uploadFileAndSend({content, duration, itemIndex, type})
        });
    }

    uploadFileAndSend({content, duration, type, itemIndex}) {
        this._page.simulateUploadFile({
            savedFilePath: content, duration, itemIndex,
            success: (content) => {
                this._page.sendMsg({
                    content: this._page.imOperator.createChatItemContent({type, content, duration}),
                    itemIndex,
                    success: (msg) => {
                        FileSaveManager.set(msg, content);
                    }
                });
            }, fail: () => {

            }
        });
    }

    resend({}) {
        //文件的重发在商业版中已经实现，开源版中需要你自行实现
    }
}