# wechat-im
### 微信小程序即时通讯组件
#### 集成方式 请看 http://blog.csdn.net/sinat_27612147/article/details/78456363

更新日志：

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
