### 常见问题及解决方案

#### 疑难问题及解答
```
1. 开发者工具提示错误`WebSocket connection to 'ws://10.4.96.52:8001/' 
   failed: Error in connection establishment: net::ERR_CONNECTION_REFUSED`
答：这是本地WebSocket服务没有开启，请先开启本地服务，端口号必须写，必须和服务端的8001保持一致。

2. 开发者工具使用报`wx://xx.xx.xx.xx不在以下 socket 合法域名列表中`。
答：点击开发者工具右上角 `详情—>不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书` 挑勾 

3. 在终端执行 gulp，报 'gulp' 不是内部或外部命令，也不是可运行的程序或批处理文件。
答：请先全局安装gulp `npm install --global gulp`，然后重新运行gulp

4. 如何使用线上的服务器来联调这个项目?
答：首先，你需要去看我上面写的`客户端WebSocket功能及会话页面`所有的内容，按照我约定的数据格式来传递数据、制定协议。
    其实WebSocket非常简单，你甚至可以把它当作https协议来看待！

5. 如何使用我将写的WebSocket服务迁移到线上服务器？
答：我之前反复强调了，本地写的WebSocket服务功能简单，仅作为演示和学习，不可能直接拿来商用的。如想商用，请二次开发。

6. 在开发工具模拟器上发送的图片消息，无法在手机端显示，反之亦然。
答：这部分的功能，需要用到你们自己的线上服务器，而这个项目并没有用到线上服务器。我讲下图片消息发送的流程 ：
    1.图片实际是需要先上传到你们自己的服务器。
    2.收到服务器回复的图片url。
    3.再将这个url作为消息发给对方。
    4.对方接收到url，现在并显示图片。
    所以知道该怎么做了吧。
```

#### bug
```
1. bug: 语音发送时，偶尔出现longpress失效，需要重启小程序才能恢复正常 [issues#14](https://github.com/unmagic/wechat-im/issues/14)
答：微信官方说明，长按的事件在低版本是有偶尔失效的情况，在sdk2.1.0之后才修复的。
   [官方社区回复链接](https://developers.weixin.qq.com/blogdetail?action=get_post_info&docid=000c4254c706005604e6356cc5c800&highline=longpress)

2. bug：运行gulp，报错`throw new assert.AssertionError AssertionError: Task function must be specified`
答：作者这边安装的是gulp3。如果你安装的是gulp4的话，gulp 4有一个变化点就是你不能像以前那样传递一个依赖任务列表。
    所以报出这个错误。如果你坚持使用gulp4的话，请参考gulp4新的依赖任务实现方式，修改项目中的gulpfile.js文件。

3. bug: 在微信开发者工具(目前最新版是1.02.1808300)的模拟器中，调用wx.saveFile时，
   出现"saveFile:fail exceeded the maximum size of the file storage limit 10M"，而本地存储的文件远远没达到10M，为什么？
答：据我测试，本地总文件达到5M左右时就会报这个错误，这应该是微信开发工具的一个bug，等待官方修复吧。
```




