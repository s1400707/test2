var    projection3857 = new OpenLayers.Projection("EPSG:3857");
var    projection4326 = new OpenLayers.Projection("EPSG:4326");
var    projection900913 = new OpenLayers.Projection("EPSG:900913");

var popup = null;

var markerType ='';
var dataStore ='';

var map = null;
var markers = []; //マーカーレイヤー

var mode = 0;
var markerUpdateTimer;
var meMarker;


//OpenLayers.Control.Crosshairs のクラスを設定
OpenLayers.Control.Crosshairs = OpenLayers.Class(OpenLayers.Control, {
  imgUrl: null,
  size: null,
  position: null,
  initialize: function(options) {
    OpenLayers.Control.prototype.initialize.apply(this, arguments);
  },
  draw: function() {
    OpenLayers.Control.prototype.draw.apply(this, arguments);
    var px = this.position.clone();
    var centered = new OpenLayers.Pixel(Math.round(px.x - (this.size.w / 2)), Math.round(px.y - (this.size.h / 2)));
    this.buttons = new Array();
    this.div = OpenLayers.Util.createAlphaImageDiv(
        OpenLayers.Util.createUniqueID("OpenLayers.Control.Crosshairs_"), 
        centered, 
        this.size, 
        this.imgUrl, 
        "absolute");
    return this.div;
  },
  setPosition: function(position) {
    this.position = position;
    var px = this.position.clone();
    var centered = new OpenLayers.Pixel(Math.round(px.x - (this.size.w / 2)), Math.round(px.y - (this.size.h / 2)));
    this.div.style.left = centered.x + "px";
    this.div.style.top = centered.y + "px";
  },
  CLASS_NAME: "OpenLayers.Control.Crosshairs"
});

//OSMの描画
function writemap(lon,lat) {
    //名取の表示 140.883215,38.173054
    var lonLat = new OpenLayers.LonLat(lon,lat)  
        .transform(
            projection4326, 
            projection900913
        );

    map = new OpenLayers.Map("canvas");
    var mapnik = new OpenLayers.Layer.OSM();
    map.addLayer(mapnik);
        
    var cross = new OpenLayers.Control.Crosshairs( {
        imgUrl: "img/crosshair.png",
        size: new OpenLayers.Size( 32, 32 ),
        position: new OpenLayers.Pixel(
          map.getCurrentSize().w / 2,
          map.getCurrentSize().h / 2 )
    } );
    map.addControl(cross);

    console.log(lat+":"+lon+":");

    map.setCenter(lonLat, 15);
    
    //現在地のマーカー
    meMarker = new OpenLayers.Layer.Markers("Markers");
    map.addLayer(meMarker);
   
   //選択されているマーカーを表示
    markers=[];
    //Checkbox();    
}

function startTracking(){
    var watchId = navigator.geolocation.watchPosition( successWatch , onGeoError , geoOptions) ;
}

geoOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0
};

function successWatch(position){
    //現在地にマーカーを表示
    //console.log(position.coords.latitude+":"+position.coords.longitude);
    var iconsize = new OpenLayers.Size(16, 16);
    var point    = new OpenLayers.Pixel(-(iconsize.w/2), -iconsize.h/2);
    var icon = selectIcon('現在地');
    var marker = new OpenLayers.Marker(
        new OpenLayers.LonLat(position.coords.longitude,position.coords.latitude)
                    .transform(projection4326,projection900913),
        new OpenLayers.Icon(icon, iconsize, point)
    );
    meMarker.destroy();
    
    if(mode != 0){
        console.log(position.coords.latitude+":"+position.coords.longitude);
        meMarker = new OpenLayers.Layer.Markers("Markers");
        map.addLayer(meMarker);
        meMarker.addMarker(marker);
    }
    
    if(mode == 2) {
        var lonLat = new OpenLayers.LonLat(
            position.coords.longitude,
            position.coords.latitude ).transform(
              new OpenLayers.Projection("EPSG:4326"),
              map.getProjectionObject() );
          map.setCenter(lonLat);
    }
}

function stopTracking(){
    // 位置情報の追跡を中止する
    navigator.geolocation.clearWatch( watchId ) ;
}

function startDrawCurrentPosition() {
    navigator.geolocation.getCurrentPosition(onInitGeoSuccess, onGeoError, geoOptions);
}

//OSMの描画時に位置情報取得に成功した場合のコールバック
function onInitGeoSuccess(position){
   //writemap(position.coords.longitude,position.coords.latitude);      
 writemap( 140.883215,38.173054);  
    startTracking();
};

//イベントメイン会場を中心に
function eventmap(lon,lat){
   var lonLat = new OpenLayers.LonLat(lon,lat) 
    .transform(
            projection4326, 
            projection900913
        );
   //console.log(lonLat+"aaa"); 
    map.setCenter(lonLat,15);
}


//OSMの描画時に位置情報取得に成功した場合のコールバック
function onGeoSuccess(position){
    current = new CurrentPoint();    
    current.geopoint = position.coords; //位置情報を保存する
  //  writemap(current.geopoint.longitude,current.geopoint.latitude);
  writemap(140.883215,38.173054);
};

//位置情報取得に失敗した場合のコールバック
function onGeoError(error){
    console.log("現在位置を取得できませんでした");
      switch(error.code) {
         case 1: //PERMISSION_DENIED
          alert("位置情報の利用が許可されていません");
          mode = 0;
          tracking_mode.innerHTML = '現在地を非表示';
　　  break;
        case 2: //POSITION_UNAVAILABLE
          alert("現在位置が取得できませんでした");
          break;
        case 3: //TIMEOUT
          alert("タイムアウトになりました");
          break;
        default:
          alert("その他のエラー(エラーコード:"+error.code+")");
          break;
      }
};


//位置情報取得時に設定するオプション
var geoOption = {
    timeout: 6000
};

//現在地を保持するクラスを作成
function CurrentPoint(){
    geopoint=null;  //端末の位置情報を保持する
}

//現在地に移動する
function current_geopoint(){
    navigator.geolocation.getCurrentPosition(onCurrentSuccess, onGeoError, geoOption);
     console.log("current_geopoint");
}
//現在値の位置情報取得に成功した場合のコールバック
function onCurrentSuccess(position){
    current = new CurrentPoint();    
    current.geopoint = position.coords; //位置情報を保存する
    map.setCenter(new OpenLayers.LonLat(current.geopoint.longitude, current.geopoint.latitude)
    .transform(projection4326,projection900913));
};

//登録されたポイントを引き出し地図上に表示する
function find_geopoint(checkDataStore){
    var lonLat = map.getCenter().transform(projection900913,projection4326);
    lonLat.lat = Math.round(lonLat.lat*1000000)/1000000;
    lonLat.lon = Math.round(lonLat.lon*1000000)/1000000;
      var  today=getDay();　//日付取得
        var geoPoint = new ncmb.GeoPoint(lonLat.lat, lonLat.lon);
        console.log("findpoints:"+lonLat.lat + ":" + lonLat.lon);
        
        var PlacePointsClass = ncmb.DataStore(checkDataStore);
        //ニフティクラウド mobile backendにアクセスして検索開始位置を指定
        PlacePointsClass.withinKilometers("geo", geoPoint)
            .lessThanOrEqualTo("startDate",today)
            .greaterThanOrEqualTo("endDate",today)
            .fetchAll()
            .then(function(results){
                var data = [];
                if(results.length) {
                    // すでに別なポップアップが開いていたら消します
                    if (popup) map.removePopup(popup);
                }
  
                for (var i = 0; i <= results.length; i++) {
                    var result = results[i];
                    markers.push(new OpenLayers.Layer.Markers("Markers"));
                    map.addLayer(markers[markers.length-1]);
                    var regist_location = result.get("geo");
                    var regist_name = result.get("name");
                    var iconsize = new OpenLayers.Size(32, 32);
                    var point    = new OpenLayers.Pixel(-(iconsize.w/2), -iconsize.h);
                    var icon = selectIcon(checkDataStore);
                    var marker = new OpenLayers.Marker(
                        new OpenLayers.LonLat(regist_location.longitude,regist_location.latitude)
                                    .transform(projection4326,projection900913),
                        new OpenLayers.Icon(icon, iconsize, point)
                    );
                    
                    //マーカー名と詳細ボタンをポップアップで表示
                    marker.tag = regist_name;
                    // switch(checkDataStore){
                      // case 'Coupon_List':
                      //    marker.tag += '<button class="button1" onclick="onClickItem('+"'"+result.get("link")+"'"+','+"'"+checkDataStore+"'"+','+"'"+result.get("objectId")+"'"+')">詳しく</button>';
                      // break;
                    //   case 'Event_List':
                    //      marker.tag += '<button class="button1" onclick="onClickItem('+"'"+result.get("link")+"'"+','+"'"+checkDataStore+"'"+','+"'"+result.get("objectId")+"'"+')">詳しく</button>';
                    //  break;
                    //  default:
                       marker.tag += '<button class="button1" onclick="onClickItem('+"'"+result.get("link")+"'"+','+"'"+checkDataStore+"'"+','+"''"+')" >詳しく</button>';
               //     break;
                //    }
                    // マーカーをタップした際にポップアップを表示
                    marker.events.register("touchstart", marker, function(event) {
                     // すでに別なポップアップが開いていたら消す
                     if (popup) map.removePopup(popup);
                     // ポップアップを作成
                     popup = new OpenLayers.Popup("chicken",
                     event.object.lonlat,
                     new OpenLayers.Size(200,60),
                     event.object.tag,
                     true);
                     // 作成したポップアップを地図に追加
                     map.addPopup(popup);
                     });
    
                    markers[markers.length-1].addMarker(marker);
                }
            });
};

//登録されたポイントを引き出し地図上に表示する
function find_eventpoint(checkDataStore,e_name){
    var lonLat = map.getCenter().transform(projection900913,projection4326);
    lonLat.lat = Math.round(lonLat.lat*1000000)/1000000;
    lonLat.lon = Math.round(lonLat.lon*1000000)/1000000;
      var  today=getDay();　//日付取得
        var geoPoint = new ncmb.GeoPoint(lonLat.lat, lonLat.lon);
        console.log("findpoints:"+lonLat.lat + ":" + lonLat.lon);
        
        var PlacePointsClass = ncmb.DataStore(checkDataStore);
        //ニフティクラウド mobile backendにアクセスして検索開始位置を指定
        PlacePointsClass.withinKilometers("geo", geoPoint)
            .lessThanOrEqualTo("startDate",today)
            .greaterThanOrEqualTo("endDate",today)
            .equalTo("mainEventName",e_name)
            .fetchAll()
            .then(function(results){
                var data = [];
                if(results.length) {
                    // すでに別なポップアップが開いていたら消します
                    if (popup) map.removePopup(popup);
                }

                for (var i = 0; i <= results.length; i++) {
                    var result = results[i];
                    markers.push(new OpenLayers.Layer.Markers("Markers"));
                    map.addLayer(markers[markers.length-1]);
                    var regist_location = result.get("geo");
                    var regist_name = result.get("name");
                    var iconsize = new OpenLayers.Size(32, 32);
                    var point    = new OpenLayers.Pixel(-(iconsize.w/2), -iconsize.h);
                    var icon = selectIcon(checkDataStore);
                    var marker = new OpenLayers.Marker(
                        new OpenLayers.LonLat(regist_location.longitude,regist_location.latitude)
                                    .transform(projection4326,projection900913),
                        new OpenLayers.Icon(icon, iconsize, point)
                    );
                    
                    //マーカー名と詳細ボタンをポップアップで表示
                    marker.tag = regist_name;
      
                   marker.tag += '<button class="button1"  onclick="onClickItem('+"'"+result.get("link")+"'"+','+"'"+checkDataStore+"'"+','+"''"+')">詳しく</button>';
                    // マーカーをタップした際にポップアップを表示
                    marker.events.register("touchstart", marker, function(event) {
                     // すでに別なポップアップが開いていたら消す
                     if (popup) map.removePopup(popup);
                     // ポップアップを作成
                     popup = new OpenLayers.Popup("chicken",
                     event.object.lonlat,
                     new OpenLayers.Size(200,60),
                     event.object.tag,
                     true);
                     // 作成したポップアップを地図に追加
                     map.addPopup(popup);
                     });
    
                    markers[markers.length-1].addMarker(marker);
                }
            });   
};

//登録されたポイントを引き出し地図上に表示する
function find_couponpoint(checkDataStore){
      var lonLat = map.getCenter().transform(projection900913,projection4326);
    lonLat.lat = Math.round(lonLat.lat*1000000)/1000000;
    lonLat.lon = Math.round(lonLat.lon*1000000)/1000000;
      var  today=getDay();　//日付取得
        var geoPoint = new ncmb.GeoPoint(lonLat.lat, lonLat.lon);
        console.log("findpoints:"+lonLat.lat + ":" + lonLat.lon);
        
        var PlacePointsClass = ncmb.DataStore(checkDataStore);
        //ニフティクラウド mobile backendにアクセスして検索開始位置を指定
        PlacePointsClass.withinKilometers("geo", geoPoint)
            .lessThanOrEqualTo("startDate",today)
            .greaterThanOrEqualTo("endDate",today)
            .notEqualTo("limit",0)
            .fetchAll()
            .then(function(results){
                var data = [];
                if(results.length) {
                    // すでに別なポップアップが開いていたら消します
                    if (popup) map.removePopup(popup);
                }
  
                for (var i = 0; i <= results.length; i++) {
                    var result = results[i];
                    markers.push(new OpenLayers.Layer.Markers("Markers"));
                    map.addLayer(markers[markers.length-1]);
                    var regist_location = result.get("geo");
                    var regist_name = result.get("name");
                    var iconsize = new OpenLayers.Size(32, 32);
                    var point    = new OpenLayers.Pixel(-(iconsize.w/2), -iconsize.h);
                    var icon = selectIcon(checkDataStore);
                    var marker = new OpenLayers.Marker(
                        new OpenLayers.LonLat(regist_location.longitude,regist_location.latitude)
                                    .transform(projection4326,projection900913),
                        new OpenLayers.Icon(icon, iconsize, point)
                    );
                    
                    //マーカー名と詳細ボタンをポップアップで表示
                    marker.tag = regist_name;
                 
                    marker.tag += '<div><button class="button1" onclick="onClickItem('+"'"+result.get("link")+"'"+','+"'"+checkDataStore+"'"+','+"'"+result.get("couponId")+"'"+')">詳しく</button></div>';
                     
                    // マーカーをタップした際にポップアップを表示
                    marker.events.register("touchstart", marker, function(event) {
                     // すでに別なポップアップが開いていたら消す
                     if (popup) map.removePopup(popup);
                     // ポップアップを作成
                     popup = new OpenLayers.Popup("chicken",
                     event.object.lonlat,
                     new OpenLayers.Size(160,80),
                     event.object.tag,
                     true);
                     // 作成したポップアップを地図に追加
                     map.addPopup(popup);
                     });
    
                    markers[markers.length-1].addMarker(marker);
                }
            });
};

function selectIcon(type) {
    //マーカータイプでアイコンを変更
    var icon = 'img/point_na32.png';
    switch(type){
        case '現在地':          icon = 'img/me.png'; break;
        case 'Event_List':    icon = 'img/marker_ibe32.png'; break;
        case 'Event_Map':    icon = 'img/marker_ibe32.png'; break;
        case 'Tourism_List':        icon = 'img/marker_kan32.png'; break;
        case 'Coupon_List':    icon = 'img/marker_cuu32.png'; break;
          case 'Coupon_Record':    icon = 'img/marker_cuu32.png'; break;
        case 'Shelter_List':      icon = 'img/marker_hin32.png'; break;
         case 'Food_List':      icon = 'img/marker_foo32.png'; break;
          case 'Shop_List':      icon = 'img/marker_kai32.png'; break;
          default:   icon = 'img/marker_ibe32.png'; break;
    }
    return icon;
}

//チェックボックス
function Checkbox(){     

  if(markers.length != 0){
    for(var i = 0; i < markers.length; i++) {
      map.removeLayer(markers[i]);
      console.log("removeLayer");
    }
    markers = [];
  }
   
  var checkDataStore = '';
    for(var i=0; i<document.chbox.elements.length-1;i++){
        // i番目のチェックボックスがチェックされているかを判定
        if(document.chbox.elements[i].checked){
            switch(document.chbox.elements[i].value){
              case "イベント":
                checkDataStore='Event_List';
                 find_geopoint(checkDataStore);
              break;
              case "観光":
                checkDataStore='Tourism_List';
                 find_geopoint(checkDataStore);
              break;
              case "クーポン":
                checkDataStore='Coupon_Record';
                 find_couponpoint(checkDataStore);
              break;
              case "避難所":
                checkDataStore='Shelter_List';
                 find_geopoint(checkDataStore);
              break;
              case "グルメ":
                checkDataStore='Food_List';
                 find_geopoint(checkDataStore);
              break;
              case "お買い物":
                checkDataStore='Shop_List';
                 find_geopoint(checkDataStore);
              break;
            }
          
          }
      }
}

//探索
function tracking() {
    switch(mode){
        case 0: //現在地を非表示
            mode = 1;  
            tracking_mode.innerHTML = '現在地を表示';
            startTracking();
            break; 
    
        case 1: //現在地を表示
            watch = navigator.compass.watchHeading(
              function (heading) {
                $("#compass")
                  .css("transform", "rotate(" + heading.magneticHeading + "deg)");
                   console.log('Orientation: ' + heading.magneticHeading);
              },
              function (err) {
                console.log('watchHeading:'+err.message);
              },
              {frequency: 1000}
            );
            mode = 2;
            tracking_mode.innerHTML = '現在地を中心に表示';
            break;
            
        case 2: //現在地を中心に表示
            navigator.compass.clearWatch(watch);
            mode = 0;
            $("#compass")
                  .css("transform", "rotate(0deg)");
            tracking_mode.innerHTML = '現在地を非表示';
            stopTracking();
            break;
    }
}
    
    function refresh() {
      navigator.geolocation.getCurrentPosition(
        function(pos) {
          lonLat = new OpenLayers.LonLat(
            pos.coords.longitude,
            pos.coords.latitude ).transform(
              new OpenLayers.Projection("EPSG:4326"),
              map.getProjectionObject() );
          map.setCenter(lonLat);
//        showMsg('getCurrentPosition',
//          pos.coords.longitude + ', ' +  pos.coords.latitude);
        },
        function(err) {
          console.log('getCurrentPosition:'+err.message);
        },
        {maximumAge: 10000, timeout: 5000, enableHighAccuracy: true}
      );
    }

//検索ダイアログ
var showDialog = function() {
  var dialog = document.getElementById('search-dialog');

  if (dialog) {
    dialog.show();
  } else {
    ons.createElement('popover.html', { append: true })
      .then(function(dialog) {
        dialog.show();
      });
  }
};

var hideDialog = function(id) {
  document
    .getElementById(id)
    .hide();
};

