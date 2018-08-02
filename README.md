# wechat-im
### 微信小程序即时通讯组件
#### 如果看不到图片 请看 http://blog.csdn.net/sinat_27612147/article/details/78456363

# 小程序即时通讯——文本、语音输入控件（一）集成

转载请注明出处：https://blog.csdn.net/sinat_27612147/article/details/78456363

[TOC]

<font color=red>2018-07-31 作者公告：现在拥有聊天列表UI的项目已经在当前的github仓库中更新了！！！目前还需要一段时间来将多个模块从业务上拆分，现在可以在stage-1.0分支预览。点击前往：[聊天列表地址](https://github.com/unmagic/wechat-im) 如需了解集成方式，请见下方，还没写完。。。</font>

## 聊天UI组件功能：

- [x] 支持发送文本、图片、语音
- [x] 支持拍照，图库选择图片、图片预览
- [x] 支持切换到文本输入时，显示发送按钮。
- [x] 支持语音播放及播放动画。
- [x] 支持配置录制语音的最短及最长时间。
- [x] 支持配置自定义事件。
- [x] 支持聊天消息按时间逆向排序。
- [x] 支持发送消息后，页面回弹到最底部。
- [x] 使用了最新的语音播放接口，同时兼容了低版本的语音播放接口。
- [x] 消息发送中、发送成功、发送失败的状态更新
- [x] 支持消息发送失败情况下，点击重发按钮重新发送
- [x] 优化时间气泡显示逻辑，相邻信息大于5分钟显示后者信息的时间
- [x] 在页面最上方增加了会话状态的UI展示
- [x] 自定义功能，显示自定义气泡。
- [x] 通过解析语音或图片消息信息，优先读取本地文件。
- [x] 实现了文件存储算法，保证10M存储空间内的语音和图片文件均为最新。
- [x] 各消息类型和各功能均已模块化，让你在浏览代码时愉悦轻松。（其实这算不上组件特性。。。）

## 聊天UI组件不支持的功能：
- 内部现使用延迟函数模拟im-sdk消息收发功能，并没有集成真实的im-sdk，将来考虑集成webSocket。
- 如果要使用群聊，目前的UI中，头像旁并没有展示成员昵称。
- 没有在本地存储聊天记录。这个原因请看文章结尾。


## 聊天输入组件

近期一直在做微信小程序，业务上要求在小程序里实现即时通讯的功能。这部分功能需要用到文本和语音输入及一些语音相关的手势操作。所以我写了一个控件来处理这些操作。

### 控件样式
![文本语音输入控件](http://img.blog.csdn.net/20171107101340228?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvc2luYXRfMjc2MTIxNDc=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

我们先来看下效果 (现在已经重新录制了动图，但因录制软件问题，图中的一些按钮的变色了，线条也少了很多像素。。。)
![小程序IM输入控件](https://github.com/unmagic/wechat-im/blob/stage-1.0/.gif/发送图片和图片预览.gif)
 
目前的功能就是动态图中展示的，我们可以使用这个控件来切换输入方式（文本或语音）、获取到输入的信息、取消语音输入、语音消息录制过短过长的判断（该接口暂时还未开放），支持发送图片和其他自定义拓展内容。（语音和图片发送失败是因为小程序新版模拟器的问题，真机上没事）。

**<font color="red">注意：本文所讲的SDK中不包含列表的展示部分及发送状态部分，SDK只测试过微信基础库1.4.0及以上版本。</font>**

这部分内容我会从集成、编写控件两个部分来讲解。毕竟大部分人都是想尽快集成来着，所以先说说集成部分。

----------


### 集成

#### 一、导入SDK相关文件
![SDK所有文件](http://img.blog.csdn.net/20171107170921077?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvc2luYXRfMjc2MTIxNDc=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)


导入SDK时一定要用图中所示的路径，不然的话你就自己挨个修改wxml和wxss里面的文件路径哈。

图片文件总共大概是45kb，chat-input文件夹总共大概41kb。<font color=red>这就是SDK所有的文件，一共在90kb左右</font>。


----------


#### 二、集成到聊天页面

##### 1.	在聊天页面中导入chat-input文件

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
chatInput.init(page, {
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
 -`minVoiceTime`: 最小录音时长，秒，小于该值则弹出‘说话时间太短’
 -`maxVoiceTime`: 最大录音时长，秒，填写的数值大于该值则按60秒处理。录音时长如果超过该值，则会保存最大时长的录音，并弹出‘说话时间超时’并终止录音
 -`startTimeDown`: 开始倒计时时间，秒，录音时长达到该值时弹窗界面更新为倒计时弹窗
 - `extraArr`：非必填。点击右侧加号时，显示的自定义功能。`picName`元素的名字就是对应`image/chat/extra`文件夹下的`png格式`的图片名称，用于展示自定义功能的图片。`description`元素用于展示自定义功能的文字说明。
 - `tabbarHeight`：非必填。这个也是用于适配。如果你的小程序有tabbar，那么需要填写这个字段，填48就行。如果你的小程序没有tabbar，那么就不要填写这个字段。原因我会在第二篇讲到。
 - `format`: 录音格式，有效值：mp3或aac，仅在基础库1.6.0及以上生效，低版本不生效
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

## 聊天列表UI

![聊天列表相关文件](https://img-blog.csdn.net/20180731171922957?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3NpbmF0XzI3NjEyMTQ3/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
关于聊天列表，我将UI封装成了多个`template`，最后统一使用`chat-item.wxml`，放到了`chat-list`中；加载方面的UI放到了`loading`文件夹中；也新增了几张图片。

对于即时通讯方面的sdk，我是用`setTimeout`来模拟的。你可以引入常见的sdk，比如腾讯的、网易的。当然你也可以使用webSocket来自己实现。

这部分的东西写完之后发现，并没有很多难点，所以我只说下集成时要注意的几点。

### 示例文件

示例页面是`pages/list/list`，可以在微信开发工具直接打开。

在`list`文件夹下，我封装了多个类，用于管理消息类型的收发和展示。

### 文本消息管理类
先看个最简单的，文本类型消息的收发和展示`text-manager.js`：

```
import IMOperator from "../im-operator";

export default class TextManager {
    constructor(page) {
        this._page = page;
    }

    /**
     * 接收到消息时，通过UI类的管理进行渲染
     * @param msg 接收到的消息，这个对象应是由 im-operator.js 中的createNormalChatItem()方法生成的。
     */
    showMsg({msg}) {
        //UI类是用于管理UI展示的类。
        this._page.UI.updateViewWhenReceive(msg);
    }

    /**
     * 发送消息时，通过UI类来管理发送状态的切换和消息的渲染
     * @param content 输入组件获取到的原始文本信息
     */
    sendOneMsg(content) {
        this._page.UI.showItemForMoment(this._page.imOperator.createNormalChatItem({
            type: IMOperator.TextType,
            content
        }), (itemIndex) => {
            this._page.sendMsg(IMOperator.createChatItemContent({type: IMOperator.TextType, content}), itemIndex);
        });
    }
}
```
### 语音消息管理类
再来看个比较复杂的，语音消息的收发和展示`voice-manager.js`:

```
import {isVoiceRecordUseLatestVersion} from "../../../modules/chat-input/chat-input";
import {saveFileRule} from "../../../utils/file";
import IMOperator from "../im-operator";
import FileManager from "../file-manager";

export default class VoiceManager {
    constructor(page) {
        this._page = page;
        this.isLatestVersion = isVoiceRecordUseLatestVersion();
        //判断是否需要使用高版本语音播放接口
        if (this.isLatestVersion) {
            this.innerAudioContext = wx.createInnerAudioContext();
        }
        //在该类被初始化时，绑定语音点击播放事件
        this._page.chatVoiceItemClickEvent = (e) => {
            let dataset = e.currentTarget.dataset;
            console.log('语音Item', dataset);
            this._playVoice({dataset})
        }
    }

    /**
     * 发送语音消息
     * @param tempFilePath 由输入组件接收到的临时文件路径
     * @param duration 由输入组件接收到的录音时间
     */
    sendOneMsg(tempFilePath, duration) {
        saveFileRule(tempFilePath, (savedFilePath) => {
            const temp = this._page.imOperator.createNormalChatItem({
                type: IMOperator.VoiceType,
                content: savedFilePath,
                duration
            });
            this._page.UI.showItemForMoment(temp, (itemIndex) => {
                this._page.simulateUploadFile({savedFilePath, duration, itemIndex}, (content) => {
                    this._page.sendMsg(IMOperator.createChatItemContent({
                        type: IMOperator.VoiceType,
                        content: content,
                        duration
                    }), itemIndex, (msg) => {
                        FileManager.set(msg, savedFilePath);
                    });
                });
            });
        });
    }

    /**
     * 停止播放所有语音
     */
    stopAllVoicePlay() {
        let that = this._page;
        if (this._page.data.isVoicePlaying) {
            this._stopVoice();
            that.data.chatItems.forEach(item => {
                if (IMOperator.VoiceType === item.type) {
                    item.isPlaying = false
                }
            });
            that.setData({
                chatItems: that.data.chatItems,
                isVoicePlaying: false
            })
        }
    }

    /**
     * 接收到消息时，通过UI类的管理进行渲染
     * @param msg 接收到的消息，这个对象应是由 im-operator.js 中的createNormalChatItem()方法生成的。
     */
    showMsg({msg}) {
        const url = msg.content;
        const localVoicePath = FileManager.get(msg);
        console.log('本地语音路径', localVoicePath);
        if (!localVoicePath) {
            wx.downloadFile({
                url,
                success: res => {
                    saveFileRule(res.tempFilePath, (savedFilePath) => {
                        const temp = this._page.imOperator.createNormalChatItem({
                            type: IMOperator.VoiceType,
                            content: savedFilePath
                        });
                        this._page.UI.updateViewWhenReceive(temp);
                        FileManager.set(msg, savedFilePath);
                    });
                }
            });
        } else {
            this._page.UI.updateViewWhenReceive(msg);
        }
    }

    /**
     * 停止播放 兼容低版本语音播放
     * @private
     */
    _stopVoice() {
        if (this.isLatestVersion) {
            this.innerAudioContext.stop();
        } else {
            wx.stopVoice();
        }
    }

    _playVoice({dataset}) {
        let that = this._page;
        if (dataset.voicePath === that.data.latestPlayVoicePath && that.data.chatItems[dataset.index].isPlaying) {
            this.stopAllVoicePlay();
        } else {
            this._startPlayVoice(dataset);
            let localPath = dataset.voicePath;//优先读取本地路径，可能不存在此文件

            this._myPlayVoice(localPath, dataset, function () {
                console.log('成功读取了本地语音');
            }, () => {
                console.log('读取本地语音文件失败，一般情况下是本地没有该文件，需要从服务器下载');
                wx.downloadFile({
                    url: dataset.voicePath,
                    success: res => {
                        console.log('下载语音成功', res);
                        this.__playVoice({
                            filePath: res.tempFilePath,
                            success: () => {
                                this.stopAllVoicePlay();
                            },
                            fail: (res) => {
                                console.log('播放失败了', res);
                            }
                        });
                    }
                });
            });
        }
    }

    /**
     * 播放语音 兼容低版本语音播放
     * @param filePath
     * @param success
     * @param fail
     * @private
     */
    __playVoice({filePath, success, fail}) {
        if (this.isLatestVersion) {
            this.innerAudioContext.src = filePath;
            this.innerAudioContext.startTime = 0;
            this.innerAudioContext.play();
            this.innerAudioContext.onError((error) => {
                this.innerAudioContext.offError();
                fail && fail(error);
            });
            this.innerAudioContext.onEnded(() => {
                this.innerAudioContext.offEnded();
                success && success();
            });
        } else {
            wx.playVoice({filePath, success, fail});
        }
    }

    _myPlayVoice(filePath, dataset, cbOk, cbError) {
        let that = this._page;
        if (dataset.isMy || that.data.isAndroid) {
            this.__playVoice({
                filePath: filePath,
                success: () => {
                    this.stopAllVoicePlay();
                    typeof cbOk === "function" && cbOk();
                },
                fail: (res) => {
                    console.log('播放失败了1', res);
                    typeof cbError === "function" && cbError(res);
                }
            });
        } else {
            wx.downloadFile({
                url: dataset.voicePath,
                success: res => {
                    console.log('下载语音成功', res);
                    this.__playVoice({
                        filePath: res.tempFilePath,
                        success: () => {
                            this.stopAllVoicePlay();
                            typeof cbOk === "function" && cbOk();
                        },
                        fail: (res) => {
                            console.log('播放失败了', res);
                            typeof cbError === "function" && cbError(res);
                        }
                    });
                }
            });
        }

    }

    _startPlayVoice(dataset) {
        let that = this._page;
        let chatItems = that.data.chatItems;
        chatItems[dataset.index].isPlaying = true;
        if (that.data.latestPlayVoicePath && that.data.latestPlayVoicePath !== chatItems[dataset.index].content) {//如果重复点击同一个，则不将该isPlaying置为false
            for (let i = 0, len = chatItems.length; i < len; i++) {
                if ('voice' === chatItems[i].type && that.data.latestPlayVoicePath === chatItems[i].content) {
                    chatItems[i].isPlaying = false;
                    break;
                }
            }
        }
        that.setData({
            chatItems: chatItems,
            isVoicePlaying: true
        });
        that.data.latestPlayVoicePath = dataset.voicePath;
    }

}

```
对于微信我也是无话可说，接口动不动就废弃。小程序基础库1.6.0以后不再维护的语音播放和录制接口，我进行了兼容处理。
图片类型的管理类与语音类型，就不上代码了。

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
### IM模拟类 `im-operator.js`
最后重点说下IM的模拟类 IMOperator。

#### 生成发送的数据的文本
<font color=red>记住，你所有发送的消息和接收到的消息，都是以文本消息的形式，只是在渲染的时候解析，生成不同的消息类型来展示！！！</font>

```
 static createChatItemContent({type = IMOperator.TextType, content = '', duration} = {}) {
        if (!content.replace(/^\s*|\s*$/g, '')) return;
        return JSON.stringify({content, type, duration});
    }

```

这是生成发送数据的文本的方法。它会返回一个JSON格式的字符串。类似于：`{"content":"233","type":"text"}`。
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
            friendId: 0,//好友id
            isMy: isMy,//我发送的消息？
            showTime: time.ifShowTime,//是否显示该次发送时间
            time: time.timeStr,//发送时间 如 09:15,
            timestamp: currentTimestamp,//该条数据的时间戳，一般用于排序
            type: type,//内容的类型，目前有这几种类型： TextType/VoiceType/ImageType/CustomType | 文本/语音/图片/自定义
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
自定义消息类型的UI类似于聊天列表中的展示聊天时间的UI。

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
这里是模拟的数据发送。我计划将来集成webSocket，实现完整的一套小程序IM体系，这部分还在研究。

```
onSimulateSendMsg({content, success, fail}) {
        //这里content即为要发送的数据
        setTimeout(() => {
            //这里的content是一个JSON格式的字符串，类似于：{"content":"233","type":"text"}
            const item = this.createNormalChatItem(JSON.parse(content));
            this._latestTImestamp = item.timestamp;

            //使用随机数来模拟数据发送失败情况
            const isSendSuccess = parseInt(Math.random() * 100) > 35;
            console.log('随机数模拟是否发送成功', isSendSuccess);
            const isChatClose = this._page.data.chatStatue === 'close';
            if (isSendSuccess || isChatClose) {
                success && success(item);
            } else {
                fail && fail();
            }
            if (isChatClose || !isSendSuccess) return;
            setTimeout(() => {

                const item = this.createNormalChatItem({type: 'text', content: '这是模拟好友回复的消息', isMy: false});
                // const item = this.createNormalChatItem({type: 'voice', content: '上传文件返回的语音文件路径', isMy: false});
                // const item = this.createNormalChatItem({type: 'image', content: '上传文件返回的图片文件路径', isMy: false});
                this._latestTImestamp = item.timestamp;
                //这里是收到好友消息的回调函数，建议传入的item是 由 createNormalChatItem 方法生成的。
                this.onSimulateReceiveMsgCb && this.onSimulateReceiveMsgCb(item);
            }, 1000);
        }, 300);

    }
```

- content：这里的content是一个JSON格式的字符串，类似于：{"content":"233","type":"text"}，是由该类中`createChatItemContent`方法生成的，在发送消息时，必须使用该方法来生成`content`。
- success：发送成功回调，我这里返回了`createNormalChatItem`生成的消息对象，模拟发送成功后IM-SDK返回的消息对象。
- fail：发送失败回调，你可以自行传参。



#### 接收数据接口 

```
onSimulateReceiveMsg(cbOk) {
        this.onSimulateReceiveMsgCb = cbOk;
    }
```
- cbOk：接收到消息的回调，这里我也是模拟的，返回了由`this.createNormalChatItem({type: 'text', content: '这是模拟好友回复的消息', isMy: false})`生成的消息对象

在上面`发送数据接口`代码中可以看到，在接收到数据时，先使用`createNormalChatItem`来生成消息类型数据，然后回调`onSimulateReceiveMsgCb`函数，即可完成数据的接收。

#### 渲染消息列表

我使用`chatItems`来存储所有的消息类型，包括自定义消息类型。
布局怎么写的我就不讲了，有关UI渲染的代码，我全部放在了`ui.js`中，自己去看下吧，也都很简单。


#### 配合使用输入组件。

最上面说的输入组件，有各种交互情况下的事件回调，在回调函数中处理对应逻辑即可。这部分的所有代码我都放到了`list.js`中。

### 最后说两句

小程序适合开发轻量级应用，不管你怎么推崇小程序，它都是有性能上的瓶颈问题的。比如说一个页面中加载大量图片会导致占用惊人的内存空间，长列表的无法复用控件问题、重复`setData()`造成页面闪动以及存储空间限制在10M等等。因此，使用小程序开发IM，不建议将历史消息存储在本地，也不建议单个页面中加载大量的聊天消息，更何况是有很多图片的聊天消息！这将造成页面卡顿，影响小程序的响应速度！而这些东西目前是无法从技术上优化的！

开发这个项目付出了我很多心血，如果对你有帮助和启发的话，希望在`GitHub`上给个`star`！也是对我工作的支持和肯定！

使用中有什么问题的话，可以在博客或GitHub上联系我。我会及时回复。

谢谢大家！

github地址https://github.com/unmagic/wechat-im

----------

更新日志：
2018-08-02
- 修复重发消息成功后的没有排序到列表底部问题
- 优化聊天页面回滚到底部场景
- 调整了代码结构，使用统一的消息类型管理类来收发消息。

2018-08-01
- 封装文本、图片、语音三部分功能

2018-07-31
 - 新建了`pages/list/list`聊天UI页面，集成了输入组件。
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
