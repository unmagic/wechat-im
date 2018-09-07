import FileManager from "./base/file-manager";

export default class ImageManager extends FileManager {
    constructor(page) {
        super(page);
        this._page.imageClickEvent = function (e) {
            wx.previewImage({
                current: e.currentTarget.dataset.url, // 当前显示图片的http链接
                urls: [e.currentTarget.dataset.url] // 需要预览的图片http链接列表
            })
        }
    }
}