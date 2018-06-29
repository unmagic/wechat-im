# wechat-im
### 微信小程序即时通讯组件
#### 集成方式 请看 http://blog.csdn.net/sinat_27612147/article/details/78456363

更新日志：

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
