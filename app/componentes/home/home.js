/**
 * Modulo Home
**/
(function() {

'use strict';

angular.module('componentes.home', [])

//Controlador Home
.controller('HomeCtrl', ['$scope', '$http', '$window', '$q', '$location', '$state', 'spot', 'Spotify', 'ModalService', function ($scope, $http, $window, $q, $location, $state, spot, Spotify, ModalService) {


  $scope.search = {
      term: '',
  };

  $scope.items = [];
  $scope.albums = [];
  $scope.proxArtist = null;
  $scope.proxAlbum = null;

  $scope.indicator = {
    code: '',
    message: ''
  };

  $scope.albumIndicator = {
    code: '',
    message: ''
  };

  $scope.s = function() {

    $scope.indicator.code = null;
    $scope.items = [];
    $scope.itemsArtist = [];
    $scope.itemsAlbum = [];

    $scope.proxArtist = null;
    $scope.proxAlbum = null;

    if($scope.search.term === '') {
      $scope.indicator.code = 0;
        $scope.indicator.message = "This search returned 0 items";
    } else {

        //$scope.query = 'album:'+$scope.search.term+' OR artist:'+$scope.search.term;
        //$scope.query = 'name:'+$scope.search.term;

        spot.search($scope.search.term, 'artist,album', '{}').then(function(data){
          console.log(data);

          $scope.itemsArtist = data.data.artists.items;
          $scope.itemsAlbum = data.data.albums.items;

          $scope.items = $scope.itemsArtist.concat($scope.itemsAlbum);

          $scope.items.sort();


          $scope.proxArtist = data.data.artists.next;
          $scope.proxAlbum = data.data.albums.next;


          console.log("Items: ", $scope.items);
          console.log("Proximo Artist", $scope.proxArtist);
          console.log("Proximo Album", $scope.proxAlbum);

          if($scope.items.length === 0) {
            $scope.indicator.code = 0;
            $scope.indicator.message = "This search returned 0 items";

          } else {
            $scope.indicator.code = 1;

          }

        }).catch(function(error) {
          $scope.indicator.code = -1;
          $scope.indicator.message = "Error during search. Try again later!!!";
        });
    }
  };

   $scope.loadAlbum = function(id) {

       $scope.albumIndicator.code = null;

       spot.getAlbumsByArtistId(id).then(function(data){
          console.log("Albums: ", data);
          $scope.albums = data.data.items;
          //$scope.prox = data.data.artists.next;
          console.log("Albums: ", $scope.albums);
          //console.log("Proximo", $scope.prox);


          if($scope.albums.length === 0) {
            $scope.albumIndicator.code = 0;
            $scope.albumIndicator.message = "This artist does not have album.";

          } else {
            $scope.albumIndicator.code = 1;

          }

        }).catch(function(error) {
          $scope.albumIndicator.code = -1;
          $scope.albumIndicator.message = "Error during search. Try again later!!!";
        });
    };

   $scope.loadMore = function() {

      var promises = [];

      $scope.itemsArtistLoadMore = [];
      $scope.itemsAlbumLoadMore = [];


      if($scope.proxArtist !== null && $scope.proxArtist !== '') {
        promises.push($scope.loadMoreArtist());
      }

      if($scope.proxAlbum !== null && $scope.proxAlbum !== '') {
          promises.push($scope.loadMoreAlbum());
      }



    $scope.loadMorePromise = $q.all(promises)
      .then(function (results) {

            console.log("Promises:", results[0], results[1]);

            $scope.items = '';


            if(results[0] !== undefined) {

              console.log("Not 1", results[0].data.albums);
              console.log("Not 2", results[0].data.artists);


              if(results[0].data.albums !== undefined) {
                $scope.itemsAlbumLoadMore = results[0].data.albums.items;
                $scope.proxAlbum = results[0].data.albums.next;

                console.log("Items: ", $scope.itemsAlbumLoadMore);
                console.log("Prox Album", $scope.proxAlbum);


              }

              if(results[0].data.artists !== undefined) {
                $scope.itemsArtistLoadMore = results[0].data.artists.items;
                $scope.proxArtist = results[0].data.artists.next;

                console.log("Items: ", $scope.itemsArtistLoadMore);
                console.log("Prox Artist", $scope.proxArtist);

              }

            }

            if(results[1] !== undefined) {

              if(results[1].data.albums !== undefined) {
                $scope.itemsAlbumLoadMore = results[1].data.albums.items;
                $scope.proxAlbum = results[1].data.albums.next;

                console.log("Items: ", $scope.itemsAlbumLoadMore);
                console.log("Prox Album", $scope.proxAlbum);

              }

              if(results[1].data.artists !== undefined) {
                $scope.itemsArtistLoadMore = results[1].data.artists.items;
                $scope.proxArtist = results[1].data.artists.next;

                console.log("Items: ", $scope.itemsArtistLoadMore);
                console.log("Prox Artist", $scope.proxArtist);

              }

            }

            $scope.items = $scope.itemsAlbumLoadMore.concat($scope.itemsArtistLoadMore);

            $scope.items.sort();


    });



  };

   $scope.loadMoreAlbum = function() {

        var df = $q.defer();

        $scope.paramsAlbum = $scope.proxAlbum.split('&');

        $scope.type = $scope.paramsAlbum[1].split('=')[1];
        $scope.market = $scope.paramsAlbum[2].split('=')[1];
        $scope.offset = $scope.paramsAlbum[3].split('=')[1];
        $scope.limit = $scope.paramsAlbum[4].split('=')[1];

        spot.search($scope.search.term, $scope.type, '{"limit":'+$scope.limit+',' +'"offset":'+$scope.offset+'}').then(function(data){
            console.log(data);

            return df.resolve(data);

          });

        return df.promise;

   };

   $scope.loadMoreArtist = function() {

        var df = $q.defer();

        $scope.paramsArtist = $scope.proxArtist.split('&');

        $scope.type = $scope.paramsArtist[1].split('=')[1];
        $scope.market = $scope.paramsArtist[2].split('=')[1];
        $scope.offset = $scope.paramsArtist[3].split('=')[1];
        $scope.limit = $scope.paramsArtist[4].split('=')[1];

          spot.search($scope.search.term, $scope.type, '{"limit":'+$scope.limit+',' +'"offset":'+$scope.offset+'}').then(function(data){

            console.log(data);

            return df.resolve(data);

          });

          return df.promise;

   };

   //Metodo para exibir modal, usando a biblioteca <!-- dwmkerr/angular-modal-service -->
    $scope.showModal = function(id) {


       ModalService.showModal({
        templateUrl: "modal.html",
        controller: "modalCtrl",
        inputs: {
            id: id

          }
      }).then(function(modal) {
        modal.element.modal();

      });
  };

}])

.controller('modalCtrl', ['$scope', 'close', '$element', 'spot', 'Spotify', 'id', function($scope, close, $element, spot, Spotify, id) {

  $scope.close = function() {
    //$element.modal('hide');
 	  close(null, 500);
  };


  $scope.albums = [];

  $scope.albumIndicator = {
    code: '',
    message: ''
  };

   $scope.loadAlbum = function(id) {

       $scope.albumIndicator.code = null;

       spot.getAlbumsByArtistId(id).then(function(data){
          console.log("Albums: ", data);
          $scope.albums = data.data.items;
          //$scope.prox = data.data.artists.next;
          console.log("Albums: ", $scope.albums);
          //console.log("Proximo", $scope.prox);


          if($scope.albums.length === 0) {
            $scope.albumIndicator.code = 0;
            $scope.albumIndicator.message = "This artist does not have album.";

          } else {
            $scope.albumIndicator.code = 1;

          }

        }).catch(function(error) {
          $scope.albumIndicator.code = -1;
          $scope.albumIndicator.message = "Error during search. Try again later!!!";
        });
    };

  $scope.loadAlbum(id);

}])

//Rota para url home
.config(function ($stateProvider) {
  $stateProvider
    .state('home',
      {
        url: '/home',
        templateUrl: 'app/componentes/home/home.html',
        controller: 'HomeCtrl as home'

  });

});

})();
