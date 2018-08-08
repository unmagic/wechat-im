# wechat-im
### 微信小程序即时通讯组件

开发这个项目付出了我很多心血，如果对你有帮助和启发的话，希望在`GitHub`上给个`star`！也是对我工作的支持和肯定！

#### 如果看不到图片 请看 http://blog.csdn.net/sinat_27612147/article/details/78456363

# 小程序即时通讯（一）输入组件及使用WebSocket通信

转载请注明出处：https://blog.csdn.net/sinat_27612147/article/details/78456363

<font color=red>2018-08-08 作者公告：现在拥有会话页面展示及WebSocket功能的项目已经在当前的github仓库中更新了！！！大家可以在master分支上预览。项目中有WebSocket服务端代码，可以创建本地WebSocket服务。</font>

## 聊天UI组件功能：
- [x] 目前项目中已使用webSocket，实现了IM的通信功能！目前包括会话列表页面、会话页面及好友页面。支持本地使用nodejs开启WebSocket服务。详见下方文档。
- [x] 支持发送文本、图片、语音，支持输入法的emoji表情
- [x] 支持拍照，图库选择图片、图片预览
- [x] 支持切换到文本输入时，显示发送按钮。
- [x] 支持语音播放及播放动画。
- [x] 支持配置录制语音的最短及最长时间。
- [x] 支持配置自定义事件。
- [x] 支持聊天消息按时间排序。
- [x] 支持发送消息后，页面回弹到最底部。
- [x] 使用了最新的语音播放接口，同时兼容了低版本的语音播放接口。
- [x] 消息发送中、发送成功、发送失败的状态更新
- [x] 支持消息发送失败情况下，点击重发按钮重新发送
- [x] 优化时间气泡显示逻辑，相邻信息大于5分钟显示后者信息的时间
- [x] 在页面最上方增加了会话状态的UI展示
- [x] 自定义功能，显示自定义气泡。
- [x] 通过解析语音或图片消息信息，优先读取本地文件。
- [x] 实现了文件存储算法，保证10M存储空间内的语音和图片文件均为最新。
- [x] 最低支持微信基础库版本为1.4.0
- [x] 各消息类型和各功能均已模块化，让你在浏览代码时愉悦轻松。（其实这算不上组件特性。。。）

## 聊天UI组件不支持的功能：
- 如果要使用群聊，目前的UI中，头像旁并没有展示成员昵称。
- 本地没有存储历史聊天消息。这个原因请看文章结尾。

### 整体效果图（加载有些慢）
我们先来看下效果 (因录制软件问题，图中的一些按钮的变色了，线条也少了很多像素。。。)

<img src="https://github.com/unmagic/wechat-im/blob/master/.gif/发送图片和图片预览.gif" width="30%" alt="发送图片和图片预览"/>发送图片和图片预览
<img src="https://github.com/unmagic/wechat-im/blob/master/.gif/消息重发和发送自定义消息.gif" width="30%" alt="消息重发和发送自定义消息"/>消息重发和发送自定义消息
<img src="https://github.com/unmagic/wechat-im/blob/master/.gif/语音.gif" width="30%" alt="发送语音消息"/>发送语音消息

## 聊天输入组件

近期一直在做微信小程序，业务上要求在小程序里实现即时通讯的功能。这部分功能需要用到文本和语音输入及一些语音相关的手势操作。所以我写了一个控件来处理这些操作。
聊天输入组件和会话页面组件是两个不同的组件，分别处理不同的业务。

### 控件样式
<img src="https://github.com/unmagic/wechat-im/blob/master/.gif/输入组件样式图.png" width="40%" alt=""/>

### 功能
- 切换输入方式（文本或语音）
- 获取输入的文本信息
- 语音输入及取消语音输入
- 语音消息录制时长过短过长的判断
- 支持发送图片（拍照或选择图库图片）和其他自定义拓展内容

**<font color="red">注意：SDK仅支持微信基础库1.4.0及以上版本。</font>**

输入组件这部分内容我会从集成、编写控件两个部分来讲解。毕竟大部分人都是想尽快集成来着，所以先说说集成部分。

----------


### 输入组件的集成

#### 一、导入SDK相关文件

输入组件相关文件在`modules/chat-input`和`image`文件夹下，示例页面是`pages/chat-input/chat-input`。

<font color=red>聊天输入组件和会话页面组件所有你需要集成的文件，打包后大小在65kb左右，已经很小了。需要注意的是，项目中的原有`.gif`文件夹已经迁移到了别的仓库，`image`文件夹中有两张用于测试的用户头像，也可以删除掉。</font>。

----------

#### 二、集成到会话页面

##### 1.	在会话页面中导入chat-input文件

 - 在聊天页的js文件中导入 `let chatInput = require('../../modules/chat-input/chat-input');`
 - 在聊天页的wxml文件中引入布局
```
<import src="../../modules/chat-input/chat-input.wxml"/> 
<template is="chat-input" data="{{inputObj:inputObj,textMessage:textMessage,showVoicePart:true}}"/>
```
 - 在聊天页的wxss文件中引入样式表`@import "../../modules/chat-input/chat-input.wxss";`
**<font color=red>根据你的路径来导入这些内容</>**

##### 2. 初始化`chatInput`

```
chatInput.init(page, 
        {
			systemInfo: wx.getSystemInfoSync(),
			minVoiceTime: 1,//秒，最小录音时长，小于该值则弹出‘说话时间太短’
            maxVoiceTime: 60,//秒，最大录音时长，大于该值则按60秒处理
            startTimeDown: 56,//秒，开始倒计时时间，录音时长达到该值时弹窗界面更新为倒计时弹窗
            format:'mp3',//录音格式，有效值：mp3或aac，仅在基础库1.6.0及以上生效，低版本不生效
            sendButtonBgColor: 'mediumseagreen',//发送按钮的背景色
            sendButtonTextColor: 'white',//发送按钮的文本颜色
            extraArr: [{
                picName: 'choose_picture',
                description: '照片'
            }, {
                picName: 'take_photos',
                description: '拍摄'
            }, {
                picName: 'close_chat',
                description: '自定义功能'
            }],
            tabbarHeigth: 48
        });
```

 
 - `page`：这个是指当前的page。
 - `systemInfo`：<font color=red>必填</font>。手机的系统信息，用于控件的适配。
 - `minVoiceTime`: 最小录音时长，秒，小于该值则弹出‘说话时间太短’
 - `maxVoiceTime`: 最大录音时长，秒，填写的数值大于该值则按60秒处理。录音时长如果超过该值，则会保存最大时长的录音，并弹出‘说话时间超时’并终止录音
 - `startTimeDown`: 开始倒计时时间，秒，录音时长达到该值时弹窗界面更新为倒计时弹窗
 - `extraArr`：非必填。点击右侧加号时，显示的自定义功能。`picName`元素的名字就是对应`image/chat/extra`文件夹下的`png格式`的图片名称，用于展示自定义功能的图片。`description`元素用于展示自定义功能的文字说明。
 - `tabbarHeight`：非必填。这个也是用于适配。如果你的小程序有tabbar，那么需要填写这个字段，填48就行。如果你的小程序没有tabbar，那么就不要填写这个字段。原因我会在第二篇讲到。
 - `format`: 录音格式，有效值：mp3或aac，仅在基础库1.6.0及以上生效，低版本不生效，当然也不会报错。
 - `sendButtonBgColor`: 发送按钮的背景色
 - `sendButtonTextColor`: 发送按钮的文本颜色

##### 3. 监听获取输入的信息
在初始化控件之后，监听信息的输入，即可获取到指定类型的信息

###### 文本信息：

```
//文本信息的输入监听
chatInput.setTextMessageListener(function (e) {
            let content = e.detail.value;//输入的文本信息
           
        });  
```

###### 语音信息：

```
//获取录音之后的音频临时文件
chatInput.recordVoiceListener(function (res, duration) {
         let tempFilePath = res.tempFilePath;//语音临时文件的路径
         let vDuration = duration;//录音时长
     });
//监听录音状态
 chatInput.setVoiceRecordStatusListener(function (status) {
            switch (status) {
                case chatInput.VRStatus.START://开始录音

                    break;
                case chatInput.VRStatus.SUCCESS://录音成功

                    break;
                case chatInput.VRStatus.CANCEL://取消录音

                    break;
                case chatInput.VRStatus.SHORT://录音时长太短

                    break;
                case chatInput.VRStatus.UNAUTH://未授权录音功能

                    break;
                case chatInput.VRStatus.FAIL://录音失败(已经授权了)

                    break;
            }
        })
```


###### 自定义功能：

```
//收起自定义功能窗口
chatInput.closeExtraView();

//自定义功能点击事件
chatInput.clickExtraListener(function (e) {
            let itemIndex = parseInt(e.currentTarget.dataset.index);//点击的自定义功能索引
            if (itemIndex === 2) {
                that.myFun();//其他的自定义功能
                return;
            }
            //选择图片或拍照
            wx.chooseImage({
                count: 1, // 默认9
                sizeType: ['compressed'],
                sourceType: itemIndex === 0 ? ['album'] : ['camera'],
                success: function (res) {
                    let tempFilePath = res.tempFilePaths[0];
                }
            });
        });
//新增右下角加号button点击事件
chatInput.setExtraButtonClickListener(function (dismiss) {
            console.log('Extra弹窗是否消失', dismiss);
        })

```
### 至此，输入组件SDK的集成就完成了！

## 客户端WebSocket功能及会话页面


### 效果图
- 会话列表
<img src="https://github.com/unmagic/.gif/blob/master/wechat-im/会话列表页面.jpg" width="25%"/>

- 会话页面
<img src="https://github.com/unmagic/.gif/blob/master/wechat-im/会话页面.jpg" width="25%"/>

- 好友页面
<img src="https://github.com/unmagic/.gif/blob/master/wechat-im/好友页面.jpg" width="25%"/>

会话页面，我将UI封装成了多个`template`，最后使用`chat-item.wxml`即可，UI相关的代码都放到了`chat-page`文件夹中；加载方面的UI放到了`loading`文件夹中；`image`文件夹中也新增了几张图片。

对于即时通讯方面的sdk，我是用的WebSocket，当然这部分内容仅供参考。你可以引入常见的sdk，比如腾讯的、网易的。

目前实现了三个页面。会话列表页面、好友列表页面、会话页面。

会话列表页面功能：
- [x] 显示好友头像、昵称、最新一条消息内容及时间、未读计数展示。
- [x] 实时更新好友最新一条消息及时间，实时更新未读计数。
- [x] 从会话页面回退到会话列表页面后，会刷新列表页面。

好友页面功能：
- [x] 显示好友头像昵称。

好友页面未实现功能：

并未实现发起聊天功能，仅供演示，如有需要，请自行实现。

会话页面功能：
- 支持发送文本、语音、图片及自定义类型消息。因发送文件类型的消息需要上传文件的服务器，所以目前仅支持发送文本消息和自定义类型消息。如果你自己配置好了上传文件的服务器，那么就可以发送语音和图片消息了。

### 重要功能模块的流程图

有网友建议画个流程图，梳理下项目中的各部分关系。

这部分的东西包括WebSocket写完之后发现，并没有很多难点，所以我只说下使用时要注意的几点。

#### 会话列表页面

示例页面是`pages/chat-list/chat-list`。

- IM连接和会话列表页收发消息流程图：

<img src="https://github.com/unmagic/.gif/blob/master/wechat-im/IM连接和收发消息流程图.png" width="100%"/>

代码非常简单。

```
// pages/chat-list/chat-list.js

/**
 * 会话列表页面
 */
Page({

    /**
     * 页面的初始数据
     */
    data: {
        conversations: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    toChat: function (e) {
        let item = e.currentTarget.dataset.item;
        delete item.latestMsg;
        delete item.unread;
        wx.navigateTo({
            url: `../chat/chat?friend=${JSON.stringify(item)}`
        });
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

        getApp().getIMWebSocket().setOnSocketReceiveMessageListener({
            listener: (msg) => {
                console.log('会话列表', msg);
                msg.type === 'get-conversations' && this.setData({conversations: msg.conversations.map(item => this.getConversationsItem(item))})
            }
        });
        getApp().getIMWebSocket().sendMsg({
            content: {
                type: 'get-conversations',
                userId: getApp().globalData.userInfo.userId//这里获取的userInfo，就是在建立webSocket连接时服务器返回的，作为你的身份信息。
            }, success: () => {
                console.log('获取会话列表消息发送成功');
            },
            fail: (res) => {
                console.log('获取会话列表失败', res);
            }
        });
    },
    getConversationsItem(item) {
        let {latestMsg, ...msg} = item;
        return Object.assign(msg, JSON.parse(latestMsg));
    }
});
```
就这些代码。结合流程图来看的话，相信你肯定能看懂。看不懂也没事，能理解思想就行，就是 注册监听、发起请求、回调监听、渲染页面。

#### 好友列表页面

示例页面是`pages/friends/friends`。

同会话列表页面，没什么好说的。

#### 会话页面

示例页面是`pages/chat/chat`。

- 会话页面发送消息流程图：

<img src="https://github.com/unmagic/.gif/blob/master/wechat-im/会话页面流程图.png" width="100%"/>

在`chat`文件夹下，我封装了多个类，用于管理消息类型的收发和展示。

首先是一个收发消息的工厂类，用于统一管理所有消息类型的收发。见`msg-manager.js`：

```
import VoiceManager from "./msg-type/voice-manager";//语音消息的收发和展示相关类
import TextManager from "./msg-type/text-manager";//文本类型消息的收发和展示相关类
import ImageManager from "./msg-type/image-manager";//图片类型消息的收发和展示相关类
import CustomManager from "./msg-type/custom-manager";//自定义类型消息的收发和展示相关类
import IMOperator from "./im-operator";//im行为管理类

export default class MsgManager {
    constructor(page) {
        this.voiceManager = new VoiceManager(page);
        this.textManager = new TextManager(page);
        this.imageManager = new ImageManager(page);
        this.customManager = new CustomManager(page);
    }

    showMsg({msg}) {
        let tempManager = null;
        switch (msg.type) {
            case IMOperator.VoiceType:
                tempManager = this.voiceManager;
                break;
            case IMOperator.ImageType:
                tempManager = this.imageManager;
                break;
            case IMOperator.TextType:
            case IMOperator.CustomType:
                tempManager = this.textManager;
        }
        tempManager.showMsg({msg});
    }

    sendMsg({type = IMOperator.TextType, content, duration}) {
        let tempManager = null;
        switch (type) {
            case IMOperator.VoiceType:
                tempManager = this.voiceManager;
                break;
            case IMOperator.ImageType:
                tempManager = this.imageManager;
                break;
            case IMOperator.CustomType:
                tempManager = this.customManager;
                break;
            case IMOperator.TextType:
                tempManager = this.textManager;
        }
        tempManager.sendOneMsg(content, duration);
    }

    stopAllVoice() {
        this.voiceManager.stopAllVoicePlay();
    }
}
```
小程序基础库1.6.0以后不再维护的语音播放和录制接口，我进行了兼容处理。

篇幅问题，各类型消息的相关类代码我就不贴了。想看的去下载吧。

### 缓存机制和文件类型消息的展示机制
- 缓存和展示机制：在展示语音或图片类型的消息时，我会优先加载已经存储在本地的文件。可以看到`showMsg()`方法中先是取`const localVoicePath = FileManager.get(msg)`，来获取本地路径。
那取到的值是什么时候设置的呢？是在发送或接收消息成功后（此时文件已下载成功），以消息的`saveKey`为key，存储成功返回的`savedFilePath`为data，建立消息和本地存储路径的映射关系，如：`FileManager.set(msg, savedFilePath)`;
这里的`saveKey`是以消息id `msgId` 和好友id `friendId`，拼接而成的。

- 存储溢出算法：在存储文件时，我参考了Android LruCache的思想编写了算法，保证在小程序10M存储限制的前提下，存储新的文件，如果溢出了，就移除最旧的文件(跟LruCache溢出时去除不常用文件的思想不太一样)。如下`file.js`

```
const MAX_SIZE = 95000000;

function saveFileRule(tempFilePath, cbOk, cbError) {
    wx.getFileInfo({
        filePath: tempFilePath,
        success: tempFailInfo => {
            let tempFileSize = tempFailInfo.size;
            // console.log('本地临时文件大小', tempFileSize);
            if (tempFileSize > MAX_SIZE) {
                typeof cbError === "function" && cbError('文件过大');
                return;
            }
            wx.getSavedFileList({
                success: savedFileInfo => {
                    // console.log('查看已存储的文件列表', savedFileInfo);
                    let fileList = savedFileInfo.fileList;
                    let wholeSize = 0;
                    fileList.forEach(item => {
                        wholeSize += item.size;
                    });
                    //这里计算需要移除的总文件大小
                    let sizeNeedRemove = wholeSize + tempFileSize - MAX_SIZE;
                    if (sizeNeedRemove >= 0) {
                        //按时间戳排序，方便后续移除文件
                        fileList.sort(function (item1, item2) {
                            return item1.createTime - item2.createTime;
                        });
                        let sizeCount = 0;
                        for (let i = 0, len = fileList.length; i < len; i++) {
                            sizeCount += fileList[i].size;
                            if (sizeCount >= sizeNeedRemove) {
                                for (let j = 0; j < i; j++) {
                                    wx.removeSavedFile({
                                        filePath: fileList[j].filePath,
                                        success: function (res) {
                                            // console.log('移除文件', res);
                                        }
                                    });
                                }
                                break;
                            }
                        }
                    }

                    wx.saveFile({
                        tempFilePath: tempFilePath,
                        success: res => {
                            typeof cbOk === "function" && cbOk(res.savedFilePath);
                        },
                        fail: cbError
                    });
                },
                fail: cbError
            });
        }
    });
}
```

### IMWebSocket `im-web-socket.js`
这个文件位于modules文件夹下。

所有的WebSocket基本操作都封装到了这个类中。我截取了重要的几处代码。

```
export default class IMWebSocket {
    constructor() {
        this._isLogin = false;
        this._msgQueue = [];
        this._onSocketOpen();
        this._onSocketMessage();
        this._onSocketError();
        this._onSocketClose();
    }

    /**
     * 创建WebSocket连接
     * 如：this.imWebSocket = new IMWebSocket();
     *    this.imWebSocket.createSocket({url: 'ws://10.4.97.87:8001'});
     * 如果你使用本地服务器来测试，那么这里的url需要用ws，而不是wss，因为用wss无法成功连接到本地服务器
     * @param url 传入你的服务端地址，端口号不是必需的。
     */
    createSocket({url}) {
        !this._isLogin && wx.connectSocket({
            url,
            header: {
                'content-type': 'application/json'
            },
            method: 'GET'
        });
    }

    /**
     * 发送消息
     * @param content 需要发送的消息，是一个对象，如{type:'text',content:'abc'}
     * @param success 发送成功回调
     * @param fail 发送失败回调
     */
    sendMsg({content, success, fail}) {
        if (this._isLogin) {
            this._sendMsg({content, success, fail});
        } else {
            this._msgQueue.push(content);
        }
    }

    _sendMsg({content, success, fail}) {
        wx.sendSocketMessage({
            data: JSON.stringify(content), success: () => {
                success && success(content);
            },
            fail: (res) => {
                fail && fail(res);
            }
        });
    }

    /**
     * 消息接收监听函数
     * @param listener
     */
    setOnSocketReceiveMessageListener({listener}) {
        this._socketReceiveListener = listener;
    }

    /**
     * 关闭webSocket
     */
    closeSocket() {
        wx.closeSocket();
    }

    /**
     * webSocket是在这里接收消息的
     * 在socket连接成功时，服务器会主动给客户端推送一条消息类型为login的信息，携带了用户的基本信息，如id，头像和昵称。
     * 在login信息接收前发送的所有消息，都会被推到msgQueue队列中，在登录成功后会自动重新发送。
     * 这里我进行了事件的分发，接收到非login类型的消息，会回调监听函数。
     * @private
     */
    _onSocketMessage() {
        wx.onSocketMessage((res) => {
            let msg = JSON.parse(res.data);
            if ('login' === msg.type) {
                this._isLogin = true;
                getApp().globalData.userInfo = msg.userInfo;
                getApp().globalData.friendsId = msg.friendsId;
                if (this._msgQueue.length) {
                    let temp;
                    while (temp = this._msgQueue.shift()) {
                        this._sendMsg({content: {...temp, userId: msg.userInfo.userId}});
                    }
                }
            } else {
                this._socketReceiveListener && this._socketReceiveListener(msg);
            }
        })
    }

}
```
也很简单，对吧。

### 在App.js中初始化IMWebSocket

```
//app.js
import IMWebSocket from "./modules/im-sdk/im-web-socket";

App({
    globalData: {
        userInfo: {},
    },
    getIMWebSocket() {
        return this.imWebSocket;
    },
    onLaunch() {
        this.imWebSocket = new IMWebSocket();

    },
    onHide() {
        // this.imWebSocket.closeSocket();
    },
    onShow() {
        this.imWebSocket.createSocket({url: 'ws://10.4.97.87:8001'});
    }
});
```


### IM模拟类 `im-operator.js`
最后重点说下IM的控制类 IMOperator。

现在在创建IMOperator时，需要你额外传入好友信息，这个信息应该是在会话列表点击时传入的，如下所示：

```
 /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const friend = JSON.parse(options.friend);
        this.initData();
        wx.setNavigationBarTitle({
            title: friend.friendName
        });
        this.imOperator = new IMOperator(this, friend);//额外传入好友信息
        ...
        ...
    },
```


#### 生成发送的数据的文本
<font color=red>记住，你所有发送的消息和接收到的消息，都是以文本消息的形式，只是在渲染的时候解析，生成不同的消息类型来展示！！！</font>

```
 createChatItemContent({type = IMOperator.TextType, content = '', duration} = {}) {
         if (!content.replace(/^\s*|\s*$/g, '')) return;
         return {
             content,
             type,
             conversationId: 0,//会话id，目前未用到
             userId: getApp().globalData.userInfo.userId,
             friendId: this.getFriendId(),//好友id
             duration
         };
     }

```

这是生成发送数据的文本的方法。它会返回一个对象。
- type: 消息类型 TextType/VoiceType/ImageType/CustomType
- content: 需要发送的原始文本信息。可以是文字、语音文件路径、图片文件路径。
- duration: 语音时长。如果是语音类型，则需要传这个字段。

#### 生成消息对象
除自定义消息类型外，其他的无论是自己发送的消息，还是好友的消息，在UI上渲染时，都是以该消息对象的格式来统一的。

```
createNormalChatItem({type = IMOperator.TextType, content = '', isMy = true, duration} = {}) {
        if (!content) return;
        const currentTimestamp = Date.now();
        const time = dealChatTime(currentTimestamp, this._latestTImestamp);
        let obj = {
            msgId: 0,//消息id
            friendId: this.getFriendId(),//好友id
            isMy: isMy,//我发送的消息？
            showTime: time.ifShowTime,//是否显示该次发送时间
            time: time.timeStr,//发送时间 如 09:15,
            timestamp: currentTimestamp,//该条数据的时间戳，一般用于排序
            type: type,//内容的类型，目前有这几种类型： text/voice/image/custom | 文本/语音/图片/自定义
            content: content,// 显示的内容，根据不同的类型，在这里填充不同的信息。
            headUrl: isMy ? this._myHeadUrl : this._otherHeadUrl,//显示的头像，自己或好友的。
            sendStatus: 'success',//发送状态，目前有这几种状态：sending/success/failed | 发送中/发送成功/发送失败
            voiceDuration: duration,//语音时长 单位秒
            isPlaying: false,//语音是否正在播放
        };
        obj.saveKey = obj.friendId + '_' + obj.msgId;//saveKey是存储文件时的key
        return obj;
    }
```
- type：消息类型 
- content：需要发送的IM消息，是由`createChatItemContent`生成的JSON格式字符串。
- isMy：是否是我自己的消息。
- duration：语音时长。如果是语音类型，则需要传这个字段。


#### 生成自定义消息类型对象
自定义消息类型的UI类似于会话页面中的展示聊天时间的UI。

```
static createCustomChatItem() {
        return {
            timestamp: Date.now(),
            type: IMOperator.CustomType,
            content: '会话已关闭'
        }
    }
```

#### 发送数据接口 
发送数据这块目前已经实现了WebSocket通信。

支持发送文本、语音、图片及自定义类型消息。不过因发送文件类型的消息需要上传文件的服务器，所以目前仅支持发送文本消息和自定义类型消息。如果你自己配置好了上传文件的服务器，那么就可以发送语音和图片消息了。

以发送文本消息为例：

首先在输入组件的文本输入监听回调接口中调用`this.msgManager`的发送消息方法`sendMsg()`

```
chatInput.setTextMessageListener((e) => {
            let content = e.detail.value;
            this.msgManager.sendMsg({type: IMOperator.TextType, content});
        });
```
在`sendMsg`方法中会去判断发送的消息类型，最终都会调用下面的IM发送接口。

```
onSimulateSendMsg({content, success, fail}) {
        //这里content即为要发送的数据
        //注意：这里的content是一个对象了，不再是一个JSON格式的字符串。这样可以在发送消息的底层接口中统一处理。
        getApp().getIMWebSocket().sendMsg({
            content,
            success: (content) => {
                //这个content格式一样,也是一个对象
                const item = this.createNormalChatItem(content);
                this._latestTImestamp = item.timestamp;
                success && success(item);
            },
            fail
        });
    }
```

- content：这里的content是一个对象，类似于：{"content":"233","type":"text"}，是由该类中`createChatItemContent`方法生成的。
- success：发送成功回调，我这里返回了`createNormalChatItem`生成的消息对象。
- fail：发送失败回调，你可以自行传参。

其他消息的发送方式都是与之类似的。

#### 会话页面接收数据接口 
关于会话页面消息是怎么接收到的，下面的展示了一个完整的主要流程。

- 会话页面接收消息流程图：

<img src="https://github.com/unmagic/.gif/blob/master/wechat-im/接收消息流程图.png" width="100%"/>

下面贴的是核心代码

```
onSimulateReceiveMsg(cbOk) {
        getApp().getIMWebSocket().setOnSocketReceiveMessageListener({
            listener: (msg) => {
                if (!msg) {
                    return;
                }
                msg.isMy = msg.msgUserId === getApp().globalData.userInfo.userId;
                const item = this.createNormalChatItem(msg);
                // const item = this.createNormalChatItem({type: 'voice', content: '上传文件返回的语音文件路径', isMy: false});
                // const item = this.createNormalChatItem({type: 'image', content: '上传文件返回的图片文件路径', isMy: false});
                this._latestTImestamp = item.timestamp;
                //这里是收到好友消息的回调函数，建议传入的item是 由 createNormalChatItem 方法生成的。
                cbOk && cbOk(item);
            }
        });

    }
```
- cbOk：接收到消息的回调，这里我也是模拟的，返回了由`this.createNormalChatItem({type: 'text', content: '这是模拟好友回复的消息', isMy: false})`生成的消息对象

在上面`发送数据接口`代码中可以看到，在接收到数据时，先使用`createNormalChatItem`来生成消息类型数据，然后回调`onSimulateReceiveMsgCb`函数，即可完成数据的接收。

我是在`chat.js`的`onLoad`生命周期中注册的监听：

```
onLoad: function (options) {

        const friend = JSON.parse(options.friend);
        console.log(friend);
        this.initData();
        wx.setNavigationBarTitle({
            title: friend.friendName
        });
        this.imOperator = new IMOperator(this, friend);
        this.UI = new UI(this);
        this.msgManager = new MsgManager(this);

        this.imOperator.onSimulateReceiveMsg((msg) => {
            //执行到这步时，好友的消息早已经接收到并生成了消息类型数据msg，接下来要做的就是将数据渲染到页面上了
            //showMsg()是用于渲染消息类型数据的。
            this.msgManager.showMsg({msg})
        });
        this.UI.updateChatStatus('正在聊天中...');
    },
```

#### 渲染消息列表

我使用`chatItems`来存储所有的消息类型，包括自定义消息类型。
布局怎么写的我就不讲了，有关UI渲染的代码，我全部放在了`ui.js`中，自己去看下吧，也都很简单。


#### 配合使用输入组件。

最上面说的输入组件，有各种交互情况下的事件回调，在回调函数中处理对应逻辑即可。这部分的所有代码我都放到了`chat.js`中。

### 以上就是客户端WebSocket及会话页面的所有难点内容

### 服务端WebSocket实现的业务功能

服务器端是用nodejs开发的，配合客户端实现了简单的IM消息展示逻辑。webSocket所有功能仅供学习和参考，若想商用，请自行开发。

项目导入成功后
1. 执行`npm install nodejs-websocket安装nodejs-websocket`安装nodejs-websocket。
2. 运行.server文件夹下的web-socket-server.js文件即可开启服务。

`nodejs-websocket`具体API详见https://www.npmjs.com/package/nodejs-websocket

服务端简单实现了两人实时聊天功能，获取历史消息，获取会话列表、好友列表。需要注意的是，目前消息都是在内存中，重启服务后所有数据会重置！

服务端代码就不贴了。

### 最后说两句

小程序适合开发轻量级应用，不管你怎么推崇小程序，它都是有性能上的瓶颈问题的。比如说一个页面中加载大量图片会导致占用惊人的内存空间，长列表的无法复用控件问题、重复`setData()`造成页面闪动以及存储空间限制在10M等等。因此，使用小程序开发IM，不建议将历史消息存储在本地，也不建议单个页面中加载大量的聊天消息，更何况是有很多图片的聊天消息！这将造成页面卡顿，影响小程序的响应速度！而这些东西目前是无法从技术上优化的！

使用中有什么问题的话，可以在博客或GitHub上联系我。我会及时回复。

谢谢大家！

github地址https://github.com/unmagic/wechat-im

----------

### 更新日志：

2018-08-08

- 现已实现WebSocket通信，项目中有WebSocket服务端代码，可以创建本地WebSocket服务。
- 现将modules中的chat-list文件夹名改为chat-page，避免和page文件夹中的chat-list混淆。

2018-08-03
- 重要提醒：现修改了会话页面和聊天输入组件展示页面的文件名称，令其更加符合业务名称。

2018-08-02
- 修复重发消息成功后的没有排序到列表底部问题
- 优化会话页面回滚到底部场景
- 调整了代码结构，使用统一的消息类型管理类来收发消息。

2018-08-01
- 封装文本、图片、语音三部分功能

2018-07-31
 - 新建了`pages/chat/chat`聊天UI页面，集成了输入组件。
 - 输入组件新增`isVoiceRecordUseLatestVersion`接口，用以判断录音接口是否使用了最新的。
 - 聊天UI页面修复bug：正在录音时，停止语音播放。
 - 聊天UI页面修复bug：播放语音时，停止播放其他语音。

2018-07-04
 - 新增右下角发送按钮，在输入框获取焦点时，会自动切换到发送按钮。点击发送按钮事件和点击键盘右下角发送按钮事件均为一个事件`setTextMessageListener`。
 - 新增发送按钮样式，如下：
 ```
 chatInput.init(pageContext, {
             sendButtonBgColor: 'mediumseagreen',
             sendButtonTextColor: 'white'
         });
 ```
 - 修复在自定义菜单弹出时，切换到文本输入并发送文本后，自定义弹窗依旧存在的问题。

2018-06-29
 - 加入`wx.getRecorderManager()`以支持小程序基础库1.6.0以上。
 - 兼容长按事件，根据版本调用`longpress`或`longtap`。
 - `init`方法参数新增`format`字段，用于管理录音格式，只在基础库1.6.0及以上生效，低版本不生效。有效格式为 aac或mp3 , 默认值为'mp3'，如下：
 ```
 chatInput.init(pageContext, {
            systemInfo: systemInfo,
            format: 'mp3'//aac/mp3
        });
 ```
 - 修复css高度样式错误问题。

2018-06-26
 - 新增右下角加号button点击事件
```
chatInput.setExtraButtonClickListener(function (dismiss) {
            console.log('Extra弹窗是否消息', dismiss);
        })
```
