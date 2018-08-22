//app.js
import IMFactory from "./modules/im-sdk/im-factory";

App({
    globalData: {
        userInfo: {},
    },
    getIMHandler() {
        return this.iIMHandler;
    },
    onLaunch() {
        this.iIMHandler = IMFactory.create();
    },
    onHide() {
        // this.iIMHandler.closeConnection();
    },
    onShow() {
        this.iIMHandler.createConnection({url: 'ws://10.4.94.185:8001'});
    }
});