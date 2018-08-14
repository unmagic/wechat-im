# wechat-im

[![Build Status](https://travis-ci.org/unmagic/wechat-im.svg?branch=master)](https://travis-ci.org/unmagic/wechat-im)
[![Version status](https://img.shields.io/badge/release-1.0.1-brightgreen.svg)](https://github.com/unmagic/wechat-im)
[![Code Size](https://img.shields.io/badge/code%20size-83kb-brightgreen.svg)](https://github.com/unmagic/wechat-im)
[![Dependency status](https://img.shields.io/badge/dependencies-none-brightgreen.svg)](https://img.shields.io/badge/dependencies-none-brightgreen.svg)
[![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/unmagic/wechat-im/blob/master/LICENSE)

### 微信小程序即时通讯

开发这个项目付出了我很多心血，如果对你有帮助和启发的话，希望在`GitHub`上给个`star`！也是对我工作的支持和肯定！

## 介绍：
wechat-im是一个可以让你在小程序平台快速实现即时通讯功能的完整模板。

## 特性：
- [x] 目前项目中已使用webSocket，实现了IM的通信功能！目前包括会话列表页面、会话页面及好友页面。支持使用nodejs开启本地WebSocket服务。
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

## 目前不支持的功能：
- 如果要使用群聊，目前的UI中，头像旁并没有展示成员昵称。
- 本地没有存储历史聊天消息。原因请看[文档](https://blog.csdn.net/sinat_27612147/article/details/78456363)结尾。
- 目前WebSocket所有功能仅供学习和参考，若想商用，请自行开发。
- 目前还不支持以插件方式使用。

## 如何安装使用

#### 1. 开发者工具导入项目
```
修改app.js文件中下面配置的url为你本地网络ip
this.imWebSocket.createSocket({url: 'ws://10.4.97.87:8001'});
```

#### 2. 搭建本地WebSocket服务
```
安装依赖 npm install
Terminal运行 gulp 即可开启WebSocket服务
```
#### 3. 使用开发者工具运行项目

如果你的项目使用这个框架并且正式投入运营，方便的话可以提供下你们的小程序二维码，我可以在这里为大家推广。

### LINK

[Document](https://blog.csdn.net/sinat_27612147/article/details/78456363)

[LICENSE](https://github.com/unmagic/wechat-im/blob/master/LICENSE)

### 合作

技术交流请加QQ群：821711186

如有合作意向或是想要推广您的产品，可加QQ：1178545208

### 欢迎打赏

<img src="https://github.com/unmagic/.gif/blob/master/admire/weixin.png" /><img src="https://github.com/unmagic/.gif/blob/master/admire/zhifubao.png" />
