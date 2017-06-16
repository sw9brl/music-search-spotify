/**
 * AngularJS - Music Search
 * @author Paulo Eduardo
 */
 (function() {
'use strict';
/**
* Modulo Principal
*/
var app = angular.module('meuApp', ['ngAnimate', 'ngTouch', 'ui.router', 'angularModalService', 'cgBusy', 'componentes.home', 'api.spot', 'spotify']);

/**
 * Config - Chamado primeiro
 */
app.config(function ($urlRouterProvider, $stateProvider, SpotifyProvider) {

  SpotifyProvider.setClientId('f06adbfb247d41beafe88dc4c8d89f3e');
  SpotifyProvider.setRedirectUri('http://localhost:8089/templates/callback.html');
  ///SpotifyProvider.setScope('user-read-private playlist-read-private playlist-modify-private playlist-modify-public');
  SpotifyProvider.setScope('');
  //SpotifyProvider.setSecret('f643d252656645e6bdd96b428f1b3293');
  //SpotifyProvider.setAuthToken('<AUTH_TOKEN>');

  $urlRouterProvider.otherwise('home');
});

/**
 * Controlador padrao
 */
app.controller('PageCtrl', function ($scope, $state) {

});


/**
 * Run - Chamado após config
 */

app.run(function ($templateCache, $http, Spotify, $q) {

  var deferred = $q.defer();

  var login = function() {

    return Spotify.login().then(function (data) {
        console.log(data);
        //alert("You are now logged in");
        return deferred.resolve(data);
      }, function () {
        //console.log('didn\'t log in');
        return deferred.reject();
      });
  };

  login().then(function(result){
      //alert("You are now logged in");
  }).catch(function(error){
      //console.log('didn\'t log in');
  });



});
})();
