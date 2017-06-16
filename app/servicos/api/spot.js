(function() {
  'use strict';

  angular.module('api.spot', [])
  .factory('spot', function($http, $q, Spotify) {

    var spot = {};

    spot.getAlbumsByArtistId = function(id) {
      var df = $q.defer();

      Spotify.getArtistAlbums(id).then(function(data){
        //console.log("Data: ", data.data.data);
        return df.resolve(data);
      }, function(res){
        return df.reject(res);
      });

      return df.promise;
    };

    spot.search = function(query, type, opt) {
     var df = $q.defer();

     console.log("Query: ", query);
     console.log("Type: ", type);

     Spotify.search(query, type, JSON.parse(opt)).then(function(data){
            //return data;
            //console.log("Data Search: ", data.data);
            return df.resolve(data);
        }, function(res){
          //console.log("Reject:  ", res);
          return df.reject(res);
        });

      return df.promise;
    };

    spot.searchOpt = function(query, type, limit_, offset_) {
     var df = $q.defer();

     console.log("Query: ", query);
     console.log("Type: ", type);
     console.log("Limit: ", limit_);
     console.log("Offset: ", offset_);

     Spotify.search(query, type, {limit: limit_, offset: offset_}).then(function(data){
            //return data;
            return df.resolve(data);
        }, function(res){
          return df.reject(res);
        });

      return df.promise;
    };

    return spot;
});

})();
