// ＳＮＳリンク

//ons.bootstrap();
ons.disableAutoStatusBarFill();  // (Monaca enables StatusBar plugin by default)

function twitText() {
    var s, url;
    s =  encodeURIComponent("#なとりすと");
    url = document.location.href;

    if (s != "") {
        if (s.length > 140) {
    	    //文字数制限
		    alert("テキストが140字を超えています");
	    } else {
		    //投稿画面を開く
		    url = "http://twitter.com/share?text=" + s;
         if( confirm("Twitterを開きます") ) {
		     var ref= cordova.InAppBrowser.open(url, '_blank', 'location=yes');
         }
        }
    }
}

function lineText() {
    var s, url;
    s =   "なとりすと";
    url = document.location.href;

    if (s != "") {
	    if (s.length > 500) {
		    //文字数制限
		    alert("テキストが500字を超えています");
	    } else {
		    //投稿画面を開く
		    url = "http://line.me/R/msg/text/" + s;
          if( confirm("LINEを開きます") ) {
		 var ref= cordova.InAppBrowser.open(url, '_blank', 'location=yes');
          }
        }
    }
}

share_pic: function share_pic(data)
    {
        Instagram.share("data:image/jpeg;base64," + data, 'example caption', function(err) {});
    }
// インスタグラムリンク
function getPhoto() {   
    if( confirm("写真を撮ってInstagramに投稿します") ) {         
    navigator.camera.getPicture(onSuccess, onFail, 
    { quality: 50, destinationType: Camera.DestinationType.DATA_URL });
    }
}

function onSuccess(imageData) {
    
    var img_tag = "なとりすと";
    
    Instagram.share("data:image/jpeg;base64," + imageData, img_tag, function(err) {});    
}

function onFail(message) {
  alert('An error Occured: ' + message);
}
