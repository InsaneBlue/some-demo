
var PMonitor = (function(global) {
    if(global.PMonitor) return PMonitor;

    var _config = {
        url: 'https://www.xxx.com/performance', // 上报 接口
        random: 1, // 抽样 0-1 1为全量
        delay: 1000, // 延迟上报
        timingOptions: {}, // 可以选择不上报部分字段
        needResourceTiming: false,
        resourceTimingOption: {
            type: ['xmlhttprequest', 'img', 'link', 'css', 'script', 'iframe'], // 默认的资源类型
            timeLimit: 10000, // 需要追踪的慢资源加载的最少毫秒数
        },
    };

    var P = {
        extend: function(target, source) {
            for(var key in source) {
                target[key] = source[key];
            }
            return target;
        },
        isPlainObject: function(value) {
            return Object.prototype.toString.call(value) === '[object Object]';
        },
        isFalse: function(value) {
            return value === false;
        },
        isRandomPassed: function() {
            return Math.random() >= _config.random;
        }
    }

    var monitor = global.PMonitor = {
        init: function(config) {
            if(P.isPlainObject(config)) {
                _config = P.extend(_config, config);
            }
            monitor.bindEvent();
            return monitor;
        },
        // 在onload事件里面绑定性能分析任务
        bindEvent: function() {
            var delay = _config.delay;
            var oriOnload = window.onload;
            window.onload = function(e) {
                if(typeof oriOnload === 'function') oriOnload(e);
                if(window.requestIdleCallback) {
                    window.requestIdleCallback(monitor.beforeSendReport, {
                        timeout: delay
                    })
                }else {
                    setTimeout(monitor.beforeSendReport, delay);
                }
            }
        },
        // 发送前的性能分析任务
        beforeSendReport: function() {
            // 根据设置的比例，采样上报
            if(P.isRandomPassed()) return;

            var oriPerformance = monitor.__oriPerformance__ = window.performance;
            var timing = oriPerformance.timing;
            var baseData = {
                timing: monitor.calculateTiming(timing),
            }

            if(_config.needResourceTiming) baseData.resource_timing = monitor.calculateResourceTiming();
            
            monitor.sendData('performance', _config.url, baseData);
        },
        // 资源加载数据的获取
        calculateResourceTiming: function() {
            var type = _config.resourceTimingOption.type || [];
            var timeLimit = _config.resourceTimingOption.timeLimit;
            var resourceData = performance.getEntries();
            data = resourceData.filter(function(resource) {
                return type.indexOf(resource.initiatorType) > -1;
            });

            return {
                slow_resource: monitor.trackSlowResource(data, timeLimit),
            }
        },
        // 追踪加载慢的资源
        trackSlowResource: function(resource, timeLimit) {
            var slowResource = resource.filter(function(r) {
                return r.duration > timeLimit;
            });
            return slowResource.map(function(r) {
                return {
                    duration: parseInt(r.duration),
                    url: r.name,
                    type: r.initiatorType,
                    size: r.encodedBodySize
                }
            })
        },
        // 借用 sa 中的数据发送方法
        sendData: function(errorType, url, data) {
            if(global.send) {
                // 这里可以改成自定义的上报方法
                global.send(errorType, url, data);
            }
        },
        // 计算timing指标
        calculateTiming: function (timing) {
            var timingOptions = _config.timingOptions;
            var timingKey = {
                // 准备新页面耗时
                prdt: timing.fetchStart - timing.navigationStart,
                // DNS解析时间
                dnst: timing.domainLookupEnd - timing.domainLookupStart || 0,  
                // TCP建立时间
                tcpt: timing.connectEnd - timing.connectStart || 0, 
                // request请求耗时
                reqt: timing.responseEnd - timing.requestStart || 0, 
                // 白屏时间, TTFB
                wipt: timing.responseStart - timing.navigationStart || 0, 
                // html文档解析时间
                doct:timing.domComplete - timing.domLoading || 0,
                // dom解析时间
                domt: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart || 0,
                // 整个页面加载时间
                lodt: timing.loadEventEnd - timing.navigationStart || 0,
                // onload事件执行时间
                onlt: timing.loadEventEnd - timing.loadEventStart || 0,
                // 上个页面卸载时间
                pult: timing.unloadEventEnd - timing.unloadEventStart || 0,
                // 重定向时间
                rdit: timing.redirectEnd - timing.redirectStart,
            }
            // 根据配置删除禁止上报的字段
            for(var key in timingOptions) {
                if(P.isFalse(timingOptions[key])) delete timingKey[key];
            }
            return timingKey;
        },

        // 每次调用window.performance得到的对象存在此处
        __oriPerformance__: null
    }

    return monitor;
}(window))

PMonitor.init({
    url: 'https://www.xxx.com/performance',
    random: 1,
    needResourceTiming: true,
    resourceTimingOption: {
        type: ['xmlhttprequest', 'img', 'link', 'css', 'script', 'iframe'], // 默认的资源类型
        timeLimit: 1000,
    },
})
