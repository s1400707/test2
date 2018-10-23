var reader;
var c_objectId2       //詳細画面のobjectId
var userid='';             //installationのobjectId
var showCoupon;  //ダイアログに表示するdetail保存
var e_name;
var e_geo;
var c_geo;

  $(window).load(function(){
  var  today=getDay();　//日付取得
  var dbName='Coupon_List';
  var items ='';
  var ncmbTimer = setInterval(function() {
  window.NCMB.monaca.getInstallationId(function(id) {
    if (id) {
      clearInterval(ncmbTimer);

      userid=id;
      console.log(userid);
      //開始期間、終了期間と比較
      var events = ncmb.DataStore(dbName);
      events .lessThanOrEqualTo("startDate",today)
      .greaterThanOrEqualTo("endDate",today)
     .fetchAll() 
      .then(function(results){
       for (var  i= 0; i< results.length; i++) {
        (function() {
          var j=i;
         var result=results[j];

          var myCoupon = ncmb.DataStore("Coupon_Record");
          var mycoupon=new myCoupon();
              //データがあるか判別
            myCoupon.equalTo("deviceId",userid)
                           .equalTo("couponId",result.get("objectId"))
                           .count()
                            .fetchAll()
                            .then(function(results1){
                              if(results1.count==0){　　//１つもない
                               mycoupon.set("deviceId",userid)
                                            .set("couponId",result.get("objectId"))
                                            .set("name",result.get("name"))
                                            .set("limit",result.get("limit"))
                                            .set("startDate",result.get("startDate"))
                                            .set("endDate",result.get("endDate"))
                                            .set("geo",result.get("geo"))
                                            .set("link",result.get("link"))
                                            .save()        
                             }                     
                            })
                           .catch(function(err){
                              console.log(err) // エラー処理
                           });  
          })();  
        } 
     })
     .catch(function(err){
        console.log(err) // エラー処理
      });   
    }
  });
}, 1000);
});
  

document.addEventListener('init', function(event) {
  var page = event.target;

  switch(page.id) {
  case 'info-page':
      //情報ページ表示時の初期設定
    
    var reader = new FileReader();
    reader.onload = function(e) {
      var dataUrl = reader.result;
      document.getElementById("info-img").src = dataUrl;
    }
    ncmb.File.download(encodeURIComponent(page.data.img), "blob")
    .then(function(blob) {
      reader.readAsDataURL(blob);
    })
    .catch(function(err) {
      console.error(err);
    })
    
    document.getElementById("info-title").innerHTML = page.data.title;
    //document.getElementById("info-img").src = page.data.img;
    document.getElementById("info-detail").innerHTML = page.data.detail;
    break;
    
    case 'coupon-info-page':
      //情報ページ表示時の初期設定
    console.log(page.data.title);
    
    var reader = new FileReader();
    reader.onload = function(e) {
      var dataUrl = reader.result;
      document.getElementById("info-img").src = dataUrl;
    }
    ncmb.File.download(encodeURIComponent(page.data.img), "blob")
    .then(function(blob) {
      reader.readAsDataURL(blob);
    })
    .catch(function(err) {
      console.error(err);
    })
    
    document.getElementById("info-title").innerHTML = page.data.title;
    //document.getElementById("info-img").src = page.data.img;
    document.getElementById("info-detail").innerHTML = page.data.detail;
    break;

     case 'event-info-page':
      //情報ページ表示時の初期設定
    console.log(page.data.title);
    
    var reader = new FileReader();
    reader.onload = function(e) {
      var dataUrl = reader.result;
      document.getElementById("info-img").src = dataUrl;
    }
    ncmb.File.download(encodeURIComponent(page.data.img), "blob")
    .then(function(blob) {
      reader.readAsDataURL(blob);
    })
    .catch(function(err) {
      console.error(err);
    })
    
    document.getElementById("info-title").innerHTML = page.data.title;
    //document.getElementById("info-img").src = page.data.img;
    document.getElementById("info-detail").innerHTML = page.data.detail;
    break;
    
    case 'map-page':
           //マップ表示
           console.log("map page init");
           writemap(140.883215,38.173054);
　　    break;
    
     case 'main-page':
    //メインページ
    displayList("News_List", "newsItems");
    break; 

    case 'coupon-page':
        //クーポンページ
        displayList("Coupon_List", "couponItems");
    break;
          
     case 'event-page':
         //イベントページ
          displayList("Event_List", "eventItems");
     break;
  }
});

function displayList(dbName, listId){
  var  today=getDay();　//日付取得
  var c_objectId1=[]; //リスト表示時のCoupon_listのobjectId保存
  var c_name=[];
  var value=0; 
  var c_limit=[];       //取得したクーポン使用回数
  var items ='';
  var flag= document.createDocumentFragment();
  var frame= document.getElementById(listId);

　//開始期間、終了期間と比較
  var events = ncmb.DataStore(dbName);
  events .lessThanOrEqualTo("startDate",today)
  .greaterThanOrEqualTo("endDate",today)
  .order("name")
  .fetchAll() 
 .then(function(results){
for (var  i= 0; i< results.length; i++) {
    (function() {
      var j=i;
     var result=results[j];
     
           //使用期間表示方法
     if(result.endDate=='2999/12/31' ){
      var deadline='';
     }else{
      deadline=result.get("startDate")+'～'+result.get("endDate");
     }

 //クーポン
    switch(dbName){
      case "Coupon_List":

      c_objectId1=result.get("objectId");  
  var myCoupon = ncmb.DataStore("Coupon_Record");
  
          //データがあるか判別
         myCoupon.equalTo("deviceId",userid)
                        .equalTo("couponId",c_objectId1)
                        .notEqualTo("limit",0)
                        .fetchAll()
                        .then(function(results1){
                  
                         c_limit[j]=results1[0].get("limit");
                           if(c_limit[j]<=-1){
                  c_limit[j]='∞';
                  }
                var  reader = new FileReader();  //ファイルの読み込み 
         var img = ncmb.DataStore("Item_info");
           img.equalTo("objectId",result.get("link"))
    .fetchAll() 
        .then(function(results){
          var pic=results[0].get("img");
        
           loadNews(pic,reader) ;
             reader.onload=function(e){
               dbName="Coupon_Record";
                items = document.createElement('ons-list-item');
                items.className="listItem";
                items.onclick=function(){onClickItem(result.get("link"),dbName,result.get("objectId"));}; 
                items.innerHTML='<div class="left"><img class="list-item__thumbnail" src ="'+reader.result+'" /></div><div class="center"><span class="list-item__title">'+result.get("name")+'</span><span class="list-item__title" style="font-size:80%">  残り'+c_limit[j]+' '+deadline+'</span></div>';
                flag.appendChild(items);       
　             frame.appendChild(flag);
              }
        })
        .catch(function(err){
          console.log(err) // エラー処理
        });  
           })
                        .catch(function(err){
                          console.log(err) // エラー処理
                        });     

        break;
   //ニュース
    case "News_List":
      var  reader = new FileReader();  //ファイルの読み込み 
      var pic=result.get("thumbnail");
       loadNews(pic,reader);
      reader.onload= function(e){ //読み込み終了
        items ='<ons-carousel-item  onclick="onClickItem('+"'"+result.get("link")+"'"+','+"'"+dbName+"'"+','+"'"+result.get("objectId")+"'"+')"  class="cal"><img src ="'+reader.result+'" alt="イメージが取得できませんでした" class="calImage" /><div class="center"><span class="list-item__title"><H7>'+result.get("name")+'</H7></span><span class="list-item__title">'+deadline+'</span></div></ons-carousel-item>';                 
        document.getElementById(listId).insertAdjacentHTML('beforeend', items);
      }
    break;

  //以外
    default: 
         var  reader = new FileReader();  //ファイルの読み込み 
         var img = ncmb.DataStore("Item_info");
           img.equalTo("objectId",result.get("link"))
    .fetchAll() 
        .then(function(results){
          var pic=results[0].get("img"); 
            loadNews(pic,reader) ;
    
            reader.onload=function(e){
               items= document.createElement('ons-list-item');
               items.className="listItem";
               items.onclick=function(){onClickItem(result.get("link"),dbName,result.get("objectId"));}; 
              items.innerHTML='<div class="left" id="imgIcon"><img class="list-item__thumbnail" src ="'+reader.result+'" /></div><div class="center"><span class="list-item__title">'+result.get("name")+'</span><span class="list-item__title">'+deadline+'</span></div>';
               flag.appendChild(items);       
　             frame.appendChild(flag);
            }     
        })
        .catch(function(err){
          console.log(err) // エラー処理
        });    
      break;
     }
   }) 
  ();   
  } 
 })
}

//リストアイテム
function onClickItem(itemLink,dbName,objectId){  
  console.log(objectId);
  var item = ncmb.DataStore("Item_info");
    item.equalTo("objectId",itemLink)
    .fetchAll() 
        .then(function(results){
           switch(dbName){
             case "Coupon_List":
            //  c_objectId2=objectId;
             showCoupon=results[0].get("detail");
            //  c_geo=results[0].get("geo");
            break;
            case "Coupon_Record":
            //  c_objectId2=objectId;
             showCoupon=results[0].get("detail");
              c_geo=results[0].get("geo");
            break;
            case "Event_List":
             e_name=results[0].get("name");
            e_geo=results[0].get("geo");
            break;
           }
             onClickInfo(results[0].get("title"), results[0].get("detail"), results[0].get("img"),dbName,objectId);
        })
         .catch(function(err){
          console.log("error") // エラー処理
        }); 
}

function onClickInfo(title,detail,img,dbName,objectId){
   var options = {};
    options.data = {};
    options.animation = 'slide';
    options.data.title = title;
    options.data.detail = detail;
    options.data.img = img;
    console.log( options.data.img);
    switch(dbName){
      case "Coupon_List":
      c_objectId2=objectId;
        NatNavi.pushPage('coupon_info.html', options); 
      break;
      case "Coupon_Record":
         c_objectId2=objectId;
        NatNavi.pushPage('coupon_info.html', options);  
      break;
      case "Event_List":
        NatNavi.pushPage('event_info.html', options);
      break;
      default:
        NatNavi.pushPage('info.html', options);
      break;
    }
}

//ページ移動ボタン
function onClickTopBtn(page){
    var options = {};
    options.animation = 'slide';
    NatNavi.pushPage(page,options);
}

//画像読み込み
function loadNews(pic,reader){                     
    ncmb.File.download(encodeURIComponent(pic), "blob")  //ファイルのダウンロード
        .then(function(blob) {
            reader.readAsDataURL(blob);  //ファイルの読み込み
        })
        .catch(function(err) {
            console.error(err);
        })
}
  
//外部ページに移動するか判別
function CheckMove(url,title) {
    if( confirm(title+"を開きます") ) {
       var ref= cordova.InAppBrowser.open(url, '_blank', 'location=yes');
    }
}

//クーポン使用okボタン押下
function registerCoupon(){
  // hideDialog('my-dialog');
  alert("画面を見せてください\n\n"+showCoupon);
              
         var myCoupon = ncmb.DataStore("Coupon_Record");
          var mycoupon=new myCoupon();
          var geo;
          var startDate;
          var endDate;
          var count;
          var name;
          var link;
          //データがあるか判別
          console.log(c_objectId2);
         myCoupon.equalTo("deviceId",userid)
                        .equalTo("couponId",c_objectId2)
                        .fetchAll()
                        .then(function(results){
                          geo=results[0].get("geo");
                          startDate=results[0].get("startDate");
                          endDate=results[0].get("endDate");
                          name=results[0].get("name");
                          link=results[0].get("link");
                         if(results[0].get("limit")==-2){  //無制限のと
                          results[0].delete();
                          mycoupon.set("deviceId",userid)
                                         .set("couponId",c_objectId2)
                                         .set("limit",-2)
                                         .set("name",name)
                                         .set("startDate",startDate)
                                         .set("endDate",endDate)
                                         .set("geo",geo)
                                         .set("link",link)
                                         .save()
                        }else {  //まだつかえるとき
                         count=results[0].get("limit");
                          results[0].delete();
                          mycoupon.set("deviceId",userid)
                                         .set("couponId",c_objectId2)
                                         .set("limit",count-1)
                                         .set("name",name)
                                         .set("startDate",startDate)
                                         .set("endDate",endDate)
                                         .set("geo",geo)
                                         .set("link",link)
                                         .save()
                        }
            
                        })
                         .catch(function(err){
                         console.log(err) // エラー処理
                        }); 
                NatNavi.popPage();
              //  fn.load('coupon.html');
}

//日付取得
function getDay(){
var newday = new Date();
  var year = newday.getFullYear();
  var month = newday.getMonth()+1;
　var day = newday.getDate();
　var today=year+'/'+month+'/'+day;

return today;
}

//クーポン使用ダイアログ
function couponDialog(){
	if(window.confirm('このクーポンを使いますか？')){
		registerCoupon();
	} else{
	window.alert('キャンセルされました'); 
	}
}

//地図
function showMap(dbName){
  console.log(dbName);
  	if(window.confirm('地図を開きますか？')){
        checkDataStore=dbName;
        NatNavi.popPage();
          fn.load('map.html');
  var countup = function(){
    if(dbName=='Coupon_Record'){
        var events = ncmb.DataStore(dbName);
  events.equalTo("deviceId",userid)
  .equalTo("couponId",c_objectId2)
  .fetchAll() 
 .then(function(result){
  var c_geo=result[0].get("geo");
 //  console.log(c_objectId2+'aaaaaaaaa');
       find_couponpoint(checkDataStore);
       eventmap(c_geo.longitude,c_geo.latitude);
       })
    }else{
       find_eventpoint(checkDataStore,e_name);
       eventmap(e_geo.longitude,e_geo.latitude);
    }
  } 
  setTimeout(countup, 1000);
    }	else{
	window.alert('キャンセルされました'); 
    }
}

//イベント等検索
function searchInfo(dbName,listId){
  var items='';
  var searchName = mySearch.value;
   var events = ncmb.DataStore(dbName);
   var c_objectId='';
    var c_limit=0;       //取得したクーポン使用回数
    //  var value =0;
 var  today=getDay(); //日付取得
 var resultClass='';
  var flag= document.createDocumentFragment();
  var frame= document.getElementById(listId);

//入欄初期化
 document.getElementById(listId).innerHTML= '';
 if(searchName==''){
   return;
 }
 
  events .lessThanOrEqualTo("startDate",today)
  .greaterThanOrEqualTo("endDate",today)
  .regularExpressionTo("name", searchName)
  .fetchAll()
  .then(function(results) {
      for (var  i= 0; i< results.length; i++) {
         (function() {
      var j=i;
      var result=results[j];
        console.log(result.get("objectId"));
        if(dbName=="Coupon_List"){
           resultClass='';
           var myCoupon = ncmb.DataStore("Coupon_Record");
          c_objectId=result.get("objectId");
          //データがあるか判別
         myCoupon.equalTo("deviceId",userid) 
                        .equalTo("couponId",c_objectId)
                        .notEqualTo("limit",0)
                        .fetchAll()
                        .then(function(result1){
                         c_limit=result1[0].get("limit");
                        // console.log(result1[0].get("couponId"));

                  if(c_limit<=-1){
                  c_limit='∞';
                }   
            dbName="Coupon_Record";
            items= document.createElement('ons-list-item');
           items.onclick=function(){onClickItem(result.get("link"),dbName,result.get("objectId"));}; 
           items.innerHTML='<div class="left"><ons-icon icon="search"></ons-icon></div><div class="center"><span class="list-item__title">'+result.get("name")+'</span><span class="list-item__title" style="font-size:80%">残り'+c_limit+'</span></div>';
           flag.appendChild(items);       
　        frame.appendChild(flag);        
        })
        .catch(function(err){
          console.log(err) // エラー処理
        });  
                   
        }else{
          resultClass=results[j].get("class");
           items= document.createElement('ons-list-item');
           items.onclick=function(){onClickItem(result.get("link"),dbName,result.get("objectId"));}; 
           items.innerHTML='<div class="left"><ons-icon icon="search"></ons-icon></div><div class="center"><span class="list-item__title">'+result.get("name")+'</span></div>';
           flag.appendChild(items);       
　        frame.appendChild(flag);
        }
      })();
     }
  })
   .catch(function(err){
    console.log(err) // エラー処理
    }); 
  
}

