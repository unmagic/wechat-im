//app.js
import AppIMDelegate from "./delegate/app-im-delegate";

App({
    globalData: {
        userInfo: {},
    },
    getIMHandler() {
        return this.appIMDelegate.getIMHandlerDelegate();
    },
    onLaunch(options) {
        this.appIMDelegate = new AppIMDelegate(this);
        this.appIMDelegate.onLaunch(options);
    },
    onHide() {
        this.appIMDelegate.onHide();
    },
    onShow(options) {
        this.appIMDelegate.onShow(options);
    }
});