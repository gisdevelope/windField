
var field = void 0;
var display = void 0;
var mapAnimator = void 0;
var overlay = void 0;
Date.prototype.format = Date.prototype.format || function (format, is_not_second) {
    format || (format = 'yyyy-MM-dd hh:mm:ss');
    var o = {
        "M{2}": this.getMonth() + 1, //month
        "d{2}": this.getDate(), //day
        "h{2}": this.getHours(), //hour
        "m{2}": this.getMinutes(), //minute
        "q{2}": Math.floor((this.getMonth() + 3) / 3) //quarter
    };
    if (!is_not_second) {
        o["s{2}"] = this.getSeconds(); //second
        o["S{2}"] = this.getMilliseconds //millisecond
        ();
    }
    if (/(y{4}|y{2})/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }

    return format;
};

function b64HmacSHA1(key, str) {
    return new Promise(function (resolve) {
        var keyBuf = new TextEncoder('utf-8').encode(key);
        var buf = new TextEncoder('utf-8').encode(str);
        var hmacSha1 = { name: 'hmac', hash: { name: 'sha-1' } };
        crypto.subtle.importKey('raw', keyBuf, hmacSha1, true, ['sign', 'verify']).then(function (out) {
            crypto.subtle.sign(hmacSha1, out, buf).then(function (result) {
                resolve(btoa(String.fromCharCode.apply(null, new Uint8Array(result))));
            });
        });
    });
}

//// 获取最新服务器数据的url及处理
var PRIVATE_KEY = 'lanpai';
var APPID = 'fx8fj7ycj8fhbgdt';
var url = 'http://scapi.weather.com.cn/weather/micaps/windfile?type=1000';
var myDate = new Date();
var date = myDate.format('yyyyMMdd');
url += (~url.indexOf('?') ? '&' : '?') + 'date=' + date + '&appid=' + APPID;
b64HmacSHA1(PRIVATE_KEY, url).then(function (key) {
    key = encodeURIComponent(key);
    var out = url.replace(/appid=.*/, 'appid=' + APPID.substr(0, 6)) + '&key=' + key;
    fetchData(out);
});
;function fetchData(url) {
    $.get(url,function (res) {
        var data = JSON.parse(res);
        field = VectorField.read(data, true
        // 经度-180和180是一样的
        );field.field.unshift(field.field[field.w - 1]);
        field.x0 = -180;
        field.w += 1;
        overlay = createOverlay(field);
        L.canvasLayer().delegate({
            onDrawLayer: function onDrawLayer(info) {
                initWindField(info.canvas, info.layer._map);
            }
        }).addTo(leafletMap

        // 两个 色彩canvas，一个本来的，一个复制平移的（投影后x加上总宽度）
        );L.canvasLayer().delegate({
            onDrawLayer: function onDrawLayer(info) {
                initWindOverlay(info.canvas, info.layer._map);
            }
        }).addTo(leafletMap);
    })
}

function initWindOverlayMain(map) {
    overlay.isoBands.forEach(function (group) {
        var polygon = L.polygon(group.coords, {
            stroke: false,
            color: group.color,
            weight: 0,
            fill: true,
            fillColor: group.color,
            fillOpacity: 1,
            clickable: false
        }).addTo(map);
    });
}

var hasDrawOverlay = false;

function initWindOverlay(canvas, map) {
    if (!hasDrawOverlay) {
        hasDrawOverlay = true;

        var ctx = canvas.getContext('2d');
        var handleStart = function handleStart(e) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
        };
        var handleEnd = function handleEnd(e) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            var _start = Date.now();
            overlay.draw(canvas, map);
            console.log(Date.now() - _start);
        };
        map.on('zoomstart', handleStart);
        map.on('zoomend', handleEnd);
        map.on('movestart', handleStart);
        map.on('moveend', handleEnd);

        overlay.draw(canvas, map);
        initWindOverlayMain(map);
    }
}

function initWindField(canvas, map) {
    if (display) {
        display.makeNewParticles(null, true);
    } else {
        var ctx = canvas.getContext('2d');

        var handleStart = function handleStart(e) {
            mapAnimator.stop = true;
        };
        var handleEnd = function handleEnd(e) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            var oBj = {
                zoom: map.getZoom(),
                lat: map.getCenter().lat,
                lng: map.getCenter().lng
            };mapAnimator.stop = false;
        };
        map.on('zoomstart', handleStart);
        map.on('zoomend', handleEnd);
        map.on('movestart', handleStart);
        map.on('moveend', handleEnd);

        display = new MotionDisplay(canvas, field, map);
        mapAnimator = new Animator();
        mapAnimator.add(display);
        mapAnimator.start(40);
    }
}
