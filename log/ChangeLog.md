
### 更新日志：

2018-09-18

- 优化：现在`app.js`中的有关IM的所有业务统一交由`app-im-delegate`管理
- 优化：现在`im-factory`以单例模式提供唯一的`IMHandler`实例

2018-09-07

- 优化：重发机制现交由各个消息类型的manager内部实现
- 优化：文件类型消息管理继承FileManager基类，统一管理发送、显示及重发
- 优化：文件缓存算法统一到fileSaveManager中
- 优化：使用策略模式优化msgManager各个方法的类型调用问题。
- 修复页面传值时因数据传输量太大导致不完整问题
- 修复服务端在传递语音消息时没有duration，以及消息没有timestamp导致客户端报错问题

2018-09-06

- 修复在点击输入法自身的隐藏按钮时，未重置右侧按钮为加号状态的bug。

2018-08-24

- 重构项目IM-SDK部分，解除WebSocket与当前业务的强耦合关系，以便项目使用者可以顺利接入其他的IM-SDK。但也因此修改了部分接口的名称。流程图中的方法名也更新了。

2018-08-15

- 优化文件存储算法，在程序启动时缓存总文件大小，避免每次都获取，浪费性能

2018-08-14

- 修复在输入框有文本的情况下，输入框失去焦点后，右下角发送按钮会重置为加号的问题

2018-08-10

- 现改为使用gulp来开启WebSocket服务。

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