
var ErrorJs = (function(global) {
    if(global.ErrorJs) return global.ErrorJs;

    var _errorMap = {}; // 存储错误id，判断是否是重复上报
    var _config = {
        id: 0, // id, 若没有id不会上报
        url: 'https://www.xxx.com/error', // 上报 接口
        ignore: [], // 忽略某个错误, 支持 Regexp 和 Function
        random: 1, // 抽样 0-1 1为全量
        delay: 1000, // 延迟上报
        repeat: 5, // 重复上报次数(对于同一个错误超过多少次不上报),
    };

    var E = {
        extend: function(target, source) {
            for(var key in source) {
                target[key] = source[key];
            }
            return target;
        },
        isObject: function(value) {
            return Object.prototype.toString.call(value) === '[object Object]';
        },
        // 判断重复次数是否超过配置的次数
        isRepeat: function(id) {
            if(!id) return false;
            var times = _errorMap[id] = (parseInt(_errorMap[id], 10) || 0) + 1;
            return times > _config.repeat;
        },
        isRandomPassed: function() {
            return Math.random() >= _config.random;
        }
    }

    // 重写onerror方法
    var orgError = global.onerror;
    global.onerror = function(msg, url, row, col, error) {
        var _id = msg + ',' + row + ',' + col;
        var errorObj = {
            msg: msg, 
            url: url, 
            row: row, 
            col: col, 
            error: error,
            _id: _id
        }
        if(_config.id) {
            report.filterError(errorObj)
        }
        orgError && orgError.apply(global, arguments);
    }

    var report = global.ErrorJs = {
        // 初始化
        init: function(config) {
            if(E.isObject(config)) {
                _config = E.extend(_config, config);
            }
            return report;
        },
        sendError: function(errorType, url, data) {
            if(global.send) {
                // 这里可以改成自定义的上报方法
                global.send(errorType, url, data);
            }
        },
        filterError: function(errorObj) {
            var errorBaseData = {
                page_type: '',
                browser_ua: '',
                client_url: errorObj.url,
                error_type: 'script_error',
                error_data: errorObj.msg,
            }

            if(E.isRepeat(errorObj._id)) return;
            if(E.isRandomPassed()) return;
            report.sendError('error', _config.url, errorBaseData);
        },
        
        __onerror__: orgError
    }

    return report;
}(window))

ErrorJs.init({
    id: 1,
    url: 'https://www.xxx.com/error',
    ignore: [/Script error/i],
    random: 1,
    repeat: 1,
})

