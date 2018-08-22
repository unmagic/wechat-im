import WebSocketHandlerImp from "./sdk/web-socket-handler-imp";

export default class IMFactory {
    static create() {
        return new WebSocketHandlerImp();
    }
}