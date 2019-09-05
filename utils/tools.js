export function downloadFile({url}) {
    return new Promise((resolve, reject) => {
        wx.downloadFile({
            url,
            success: resolve,
            fail: reject
        });
    })
}
