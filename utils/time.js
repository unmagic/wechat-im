let now = new Date();
let year = now.getFullYear();
let month = now.getMonth();//真实的月份需要再加上1
let day = now.getDate();
let currentTime = new Date();

function dealChatTime(currentItemTimeStamp, frontItemTimeStamp) {
    let ifShowTime = timeDivide(currentItemTimeStamp, frontItemTimeStamp);
    return justSimpleDealTime(currentItemTimeStamp, ifShowTime);
}

function timeDivide(currentItemTimeStamp, frontItemTimeStamp) {
    // console.log('时间戳显示时间', currentItemTimeStamp, frontItemTimeStamp);
    return Math.abs(currentItemTimeStamp - frontItemTimeStamp) / 1000 > 300
}

function justSimpleDealTime(currentItemTimeStamp, ifShowTime) {
    currentTime.setTime(currentItemTimeStamp);
    let hoursAndMinutes = currentTime.getHours() + ':' + (currentTime.getMinutes() >= 10 ? currentTime.getMinutes() : ('0' + currentTime.getMinutes()));
    let currentTimeDay = currentTime.getDate();
    if (currentTime.getFullYear() === year && currentTime.getMonth() === month) {
        if (currentTimeDay === day) {//当天显示时分
            return {//5分钟内发送多条消息时不重复显示时间标签,大于5分钟显示时间标签
                ifShowTime: ifShowTime,
                timeStr: hoursAndMinutes
            };
        } else if (currentTimeDay === day - 1) {//昨天：昨天+时分（24小时制）
            return {ifShowTime: ifShowTime, timeStr: '昨天 ' + hoursAndMinutes}
        }
    }
    return {
        ifShowTime: ifShowTime,
        timeStr: currentTime.getFullYear() + '年' + (currentTime.getMonth() + 1) + '月' + currentTimeDay + '日 ' + hoursAndMinutes
    };
}

module.exports = {
    dealChatTime
};