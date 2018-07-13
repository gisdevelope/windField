$(function(){
    let field;
    let display;
    let mapAnimator;
    let overlay;
    let crypto = require('crypto');
    let url = 'http://scapi.weather.com.cn/weather/micaps/windfile?';
    //KEY计算 return key
    let PRIVATE_KEY = 'lanpai';
    let APPID = 'fx8fj7ycj8fhbgdt';
    let aRedarw = [];
    let aRadarImg = [];
    let iRadarImge = 0;
    let oData,imageOverlay,RadarTimer;

    function timeObj(){
        let oDate = new Date();
        function addZero(n){return n>=10?n+'':'0'+n;}
        return {
            "year":oDate.getFullYear(),
            "month":addZero(oDate.getMonth()+1),
            "date":addZero(oDate.getDate()),
            "hours":addZero(oDate.getHours()),
            "minutes":addZero(oDate.getMinutes())
        }
    }
    function _encryURL(url) {
        var myDate = timeObj();
        var date = myDate.year+myDate.month+myDate.date;
        url += (~url.indexOf('?') ? '&' : '?')+ 'type=1000&date=' + date + '&appid=' + APPID;
        var hmac = crypto.createHmac('sha1', PRIVATE_KEY);
        hmac.write(url);
        hmac.end();
        var key = hmac.read().toString('base64');
        key = encodeURIComponent(key);

        return url.replace(/appid=.*/, 'appid=' + APPID.substr(0, 6)) + '&key=' + key;
    }
    //获取风场
    !function reqDate(){
        fetch( _encryURL( url) )
        .then(res => res.json())
        .then(data => {
            oData = data;
            parseWindData(oData);
            var styleParameter = $('.leaflet-map-pane').attr('style');
            var aStyle = styleParameter.substring(styleParameter.indexOf('(')+1,styleParameter.lastIndexOf(')')).split(',');
            $('.leaflet-overlay-pane>canvas').css('transform','translate3d('+ (-parseInt(aStyle[0])) +'px, '+ (-parseInt(aStyle[1])) +'px, 0px)').hide();
        })
    }()
    
    //获取云图数据
    $.getJSON('http://decision-admin.tianqi.cn/Home/other/getDecisionCloudImages',function(data){
        var aData = data.l.reverse();
        var PRIVATE_KEY = 'chinaweather_data';
        var APPID = '6f688d62594549a2';
        var imageBounds = [[-10.787277369124666, 62.8820698883665], [56.385845314127209, 161.69675114151386]];

        imageOverlay = L.imageOverlay(encryURL(aData[ aData.length-1 ].l2, PRIVATE_KEY, APPID), imageBounds);
        
        //云图url处理
        function encryURL(url, private_key, appid) {
            var myDate = timeObj();
            var date = myDate.year+myDate.month+myDate.date+myDate.hours+myDate.minutes;
            url += (~url.indexOf('?')?'&':'?') +'date='+date+'&appid='+appid;
            var hmac = crypto.createHmac('sha1', private_key);
            hmac.write(url);
            hmac.end();
            var key = hmac.read().toString('base64');
            key = encodeURIComponent(key);

            return url.replace(/appid=.*/,'appid='+appid.substr(0,6)) + '&key=' + key;
        }
    })
    //获取雷达图数据
    $.getJSON('http://api.tianqi.cn:8070/v1/img.py',function(data){
        if(data.status == "ok"){
            var aImg = data.radar_img;
            var imageBounds = [[-4.98, 50.02], [59.97, 144.97]];
            for(var i = 0; i<aImg.length; i++){
                var imge = L.imageOverlay(aImg[i][0], imageBounds);
                imge.setOpacity(0);
                aRadarImg.push(imge);
            }
        }
        // var imageBounds = [[-4.98, 50.02], [59.97, 144.97]];
    })
    function playRadar(){
        for(var i = 0; i<aRadarImg.length; i++){
            leafletMap.addLayer(aRadarImg[i]);
        }
        RadarTimer = setInterval(function(){
            iRadarImge++;
            if( iRadarImge == aRadarImg.length ){
                iRadarImge = 0;
            }
            for(var i = 0; i<aRadarImg.length; i++){
                aRadarImg[i].setOpacity(0);
            }
            aRadarImg[iRadarImge].setOpacity(1);
        },200)
    }
    function stopPlay(){
        clearInterval(RadarTimer);
        for(var i = 0; i<aRadarImg.length; i++){
            leafletMap.removeLayer(aRadarImg[i]);
        }
    }
    //绘制中国区域
    // function chinaLine(){
    //     //绘画地图边界
    //     $.getJSON('./data/mapJSON/china_bj.json',function(data){
    //         var aPolyline = data.features[0].geometry.coordinates[0];
    //         for (var i = 0; i < aPolyline.length; i++) {
    //             var points = [];
    //             for (var j = 0; j < aPolyline[i].length; j++) {
    //             points.push(new T.LngLat( aPolyline[i][j][0] , aPolyline[i][j][1] ));
    //             }
    //             var Polyline = new T.Polyline(points,{
    //                             color: "#ffff00", weight: 2, opacity: 1, lineStyle:'solid'
    //                             });
    //         var Polyline2 = new T.Polyline(points,{
    //                             color: "#9e9260", weight: 6, opacity: 0.6, lineStyle:'solid'
    //                         });
    //             map.addLayer(Polyline2);
    //             map.addLayer(Polyline);
    //         }
    //     })
    // }
    //风场，云图，雷达
    $('.warning-btn li').on(clickEvent,function(){
        if($(this).hasClass('act')){
            if($(this).hasClass('typhoon_fc')){
                $('.leaflet-overlay-pane>canvas').hide();
            }
            if($(this).hasClass('typhoon_wx')){
                leafletMap.removeLayer(imageOverlay);
            }
            if($(this).hasClass('typhoon_radar')){
                stopPlay();
            }
            $(this).removeClass('act');
        }else{
            if( $(this).hasClass('typhoon_radar') ){
                playRadar();
                leafletMap.removeLayer(imageOverlay);
                $('.typhoon_wx').removeClass('act');
            }
            if($(this).hasClass('typhoon_wx')){
                leafletMap.addLayer(imageOverlay);
                stopPlay();
                $('.typhoon_radar').removeClass('act');
            }
            if($(this).hasClass('typhoon_fc')){
                if(oData){
                    parseWindData(oData)
                    $('.leaflet-overlay-pane>canvas').fadeIn()
                }
            }

            $(this).addClass('act');
        }

        hideLayer();
        return false;
    })


    //隐藏色图层
    function hideLayer(){
        if(aRedarw.length){
            if ($('.typhoon_fc').hasClass('act')) {
                for (var i = 0; i < aRedarw.length; i++) {
                    leafletMap.addLayer(aRedarw[i]);
                }
            }else{
                for (var i = 0; i < aRedarw.length; i++) {
                    leafletMap.removeLayer(aRedarw[i]);
                }
            }
        }
    }

    function parseWindData(data){
        field = VectorField.read(data, true);
        // 经度-180和180是一样的
        field.field.unshift(field.field[field.w - 1]);
        field.x0 = -180;
        field.w += 1;
        overlay = createOverlay(field);

        if(display){
            display.field = field;
        }else{
            L.canvasLayer()
                .delegate({
                    onDrawLayer: info => {
                        initWindField(info.canvas, info.layer._map)
                    }
                })
                .addTo(leafletMap)

            // 两个 色彩canvas，一个本来的，一个复制平移的（投影后x加上总宽度）
            L.canvasLayer()
                .delegate({
                    onDrawLayer: info => {
                        initWindOverlay(info.canvas, info.layer._map)
                    }
                })
                .addTo(leafletMap)
        }
        
    }

    function initWindOverlayMain(map) {
        aRedarw = [];
        overlay.isoBands.forEach(function (group) {
            let polygon = L.polygon(group.coords, {
                stroke: false,
                color: group.color,
                weight: 0,
                fill: true,
                fillColor: group.color,
                fillOpacity: 1,
                clickable: false,
            });
            aRedarw.push(polygon);
        })
    }

    let hasDrawOverlay = false

    function initWindOverlay(canvas, map) {
        if (!hasDrawOverlay) {
            hasDrawOverlay = true

            let ctx = canvas.getContext('2d')
            let handleStart = function (e) {
                // ctx.clearRect(0, 0, canvas.width, canvas.height)
            }
            let handleEnd = function (e) {
                ctx.clearRect(0, 0, canvas.width, canvas.height)

                let _start = Date.now()
                overlay.draw(canvas, map)
            }
            map.on('zoomstart', handleStart)
            map.on('zoomend', handleEnd)
            map.on('movestart', handleStart)
            map.on('moveend', handleEnd)

            overlay.draw(canvas, map)
            initWindOverlayMain(map)
        }
    }

    function initWindField(canvas, map) {
        if (display) {
            display.makeNewParticles(null, true)
        } else {
            let ctx = canvas.getContext('2d')

            let handleStart = function (e) {
                mapAnimator.stop = true
            }
            let handleEnd = function (e) {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                var oBj = {
                    zoom : map.getZoom(),
                    lat : map.getCenter().lat,
                    lng : map.getCenter().lng
                }
                // socket.emit('anotherNews', oBj );
                mapAnimator.stop = false
            }
            map.on('zoomstart', handleStart)
            map.on('zoomend', handleEnd)
            map.on('movestart', handleStart)
            map.on('moveend', handleEnd)

            display = new MotionDisplay(canvas, field, map)
            mapAnimator = new Animator()
            mapAnimator.add(display)
            mapAnimator.start(40)
        }
    }
})

