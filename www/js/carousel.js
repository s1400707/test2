function news(){
var News = ncmb.DataStore("News_List");
    console.log("news get");
News.fetch()
    .then(function(results){
         for (var i = 0; i < results.length; i++) {
            var object = results[i];
            console.log(object.get("head"));
         }
    })
    .catch(function(err){
            console.log(err);
    });
}



