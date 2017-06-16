(function() {
  'use strict';

  angular.module('api.spot', [])
  .factory('spot', function($http, $q, Spotify) {

    var spot = {};

    spot.getAlbumsByArtistId = function(id) {
      var df = $q.defer();

      Spotify.getArtistAlbums(id).then(function(data){
        void 0;
        return df.resolve(data);
      }, function(res){
        return df.reject(res);
      });

      return df.promise;
    };

    spot.search = function(query, type, opt) {
     var df = $q.defer();

     void 0;
     void 0;

     Spotify.search(query, type, JSON.parse(opt)).then(function(data){
            //return data;
            void 0;
            return df.resolve(data);
        }, function(res){
          void 0;
          return df.reject(res);
        });

      return df.promise;
    };

    spot.searchOpt = function(query, type, limit_, offset_) {
     var df = $q.defer();

     void 0;
     void 0;
     void 0;
     void 0;

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
