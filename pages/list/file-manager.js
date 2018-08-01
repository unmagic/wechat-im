export default class FileManager {
    constructor() {

    }

    static set({msgPath, localPath}) {
        wx.setStorage({key: msgPath, data: localPath})
    }

    static get(msgPath) {
        return wx.getStorageSync(msgPath);
    }
}