export default class FileManager {
    constructor() {

    }

    static set(msg, localPath) {
        wx.setStorage({key: msg.saveKey, data: localPath})
    }

    static get(msg) {
        return wx.getStorageSync(msg.saveKey);
    }
}