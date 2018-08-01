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
                    let sizeNeedRemove = wholeSize + tempFileSize - MAX_SIZE;
                    if (sizeNeedRemove >= 0) {
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

module.exports = {
    saveFileRule
};