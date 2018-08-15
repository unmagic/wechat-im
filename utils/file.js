const MAX_SIZE = 10400000;
let wholeSize = 0;
setTimeout(() => {
    wx.getSavedFileList({
        success: savedFileInfo => {
            let {fileList} = savedFileInfo;
            !!fileList && fileList.forEach(item => {
                wholeSize += item.size;
            });
        }
    });
});

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
                    let {fileList} = savedFileInfo;
                    if (!fileList) {
                        typeof cbError === "function" && cbError('获取到的fileList为空，请检查你的wx.getSavedFileList()函数的success返回值');
                        return;
                    }
                    //这里计算需要移除的总文件大小
                    let sizeNeedRemove = wholeSize + tempFileSize - MAX_SIZE;
                    if (sizeNeedRemove >= 0) {
                        //按时间戳排序，方便后续移除文件
                        fileList.sort(function (item1, item2) {
                            return item1.createTime - item2.createTime;
                        });
                        let sizeCount = 0;
                        for (let i = 0, len = fileList.length; i < len; i++) {
                            if ((sizeCount += fileList[i].size) >= sizeNeedRemove) {
                                for (let j = 0; j < i; j++) {
                                    wx.removeSavedFile({
                                        filePath: fileList[j].filePath,
                                        success: function () {
                                            wholeSize -= fileList[j].size;
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
                            wholeSize += tempFileSize;
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

module.exports = {
    saveFileRule
};