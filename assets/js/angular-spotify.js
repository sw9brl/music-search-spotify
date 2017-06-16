(function (window, angular, undefined) {
  'use strict';

  angular
    .module('spotify', [])
    .provider('Spotify', function () {

      // Module global settings.
      var settings = {};
      settings.clientId = null;
      settings.secret = null;
      settings.redirectUri = null;
      settings.scope = null;
      settings.authToken = null;

      this.setClientId = function (clientId) {
        settings.clientId = clientId;
        return settings.clientId;
      };

      this.getClientId = function () {
        return settings.clientId;
      };

      this.setSecret = function (secret) {
        settings.secret = secret;
        return settings.secret;
      };

      this.getSecret = function () {
        return settings.secret;
      };


      this.setAuthToken = function (authToken) {
        settings.authToken = authToken;
        return settings.authToken;
      };

      this.setRedirectUri = function (redirectUri) {
        settings.redirectUri = redirectUri;
        return settings.redirectUri;
      };

      this.getRedirectUri = function () {
        return settings.redirectUri;
      };

      this.setScope = function (scope) {
        settings.scope = scope;
        return settings.scope;
      };

      var utils = {};
      utils.toQueryString = function (obj) {
        var parts = [];
        angular.forEach(obj, function (value, key) {
          this.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        }, parts);
        return parts.join('&');
      };

      /**
       * API Base URL
       */
      settings.apiBase = 'https://api.spotify.com/v1';

      this.$get = ['$q', '$http', '$window', function ($q, $http, $window) {

        function NgSpotify () {
          this.clientId = settings.clientId;
          this.redirectUri = settings.redirectUri;
          this.apiBase = settings.apiBase;
          this.scope = settings.scope;
          this.authToken = settings.authToken;
          this.toQueryString = utils.toQueryString;
        }

        function openDialog (uri, name, options, cb) {
          var win = window.open(uri, name, options);
          var interval = window.setInterval(function () {
            try {
              if (!win || win.closed) {
                window.clearInterval(interval);
                cb(win);
              }
            } catch (e) {}
          }, 1000);
          return win;
        }

        NgSpotify.prototype = {
          api: function (endpoint, method, params, data, headers) {
            var deferred = $q.defer();

            $http({
              url: this.apiBase + endpoint,
              method: method ? method : 'GET',
              params: params,
              data: data,
              headers: headers,
              withCredentials: false
            })
            .then(function (data) {
              deferred.resolve(data);
            })
            .catch(function (data) {
              deferred.reject(data);
            });
            return deferred.promise;
          },

          _auth: function (isJson) {
            var auth = {
              'Authorization': 'Bearer ' + this.authToken
            };
            if (isJson) {
              auth['Content-Type'] = 'application/json';
            }
            return auth;
          },

          /**
            ====================== Albums =====================
           */

          /**
           * Gets an album
           * Pass in album id or spotify uri
           */
          getAlbum: function (album) {
            album = album.indexOf('spotify:') === -1 ? album : album.split(':')[2];

            return this.api('/albums/' + album);
          },

          /**
           * Gets an album
           * Pass in comma separated string or array of album ids
           */
          getAlbums: function (albums) {
            albums = angular.isString(albums) ? albums.split(',') : albums;
            angular.forEach(albums, function (value, index) {
              albums[index] = value.indexOf('spotify:') > -1 ? value.split(':')[2] : value;
            });
            return this.api('/albums', 'GET', {
              ids: albums ? albums.toString() : ''
            });
          },

          /**
           * Get Album Tracks
           * Pass in album id or spotify uri
           */
          getAlbumTracks: function (album, options) {
            album = album.indexOf('spotify:') === -1 ? album : album.split(':')[2];

            return this.api('/albums/' + album + '/tracks', 'GET', options);
          },


          /**
            ====================== Artists =====================
           */

          /**
           * Get an Artist
           */
          getArtist: function (artist) {
            artist = artist.indexOf('spotify:') === -1 ? artist : artist.split(':')[2];

            return this.api('/artists/' + artist);
          },

          /**
           * Get multiple artists
           */
          getArtists: function (artists) {
            artists = angular.isString(artists) ? artists.split(',') : artists;
            angular.forEach(artists, function (value, index) {
              artists[index] = value.indexOf('spotify:') > -1 ? value.split(':')[2] : value;
            });
            return this.api('/artists/', 'GET', {
              ids: artists ? artists.toString() : ''
            });
          },

          //Artist Albums
          getArtistAlbums: function (artist, options) {
            artist = artist.indexOf('spotify:') === -1 ? artist : artist.split(':')[2];

            return this.api('/artists/' + artist + '/albums', 'GET', options, null, this._auth());
          },

          /**
           * Get Artist Top Tracks
           * The country: an ISO 3166-1 alpha-2 country code.
           */
          getArtistTopTracks: function (artist, country) {
            artist = artist.indexOf('spotify:') === -1 ? artist : artist.split(':')[2];

            return this.api('/artists/' + artist + '/top-tracks', 'GET', {
              country: country
            });
          },

          getRelatedArtists: function (artist) {
            artist = artist.indexOf('spotify:') === -1 ? artist : artist.split(':')[2];

            return this.api('/artists/' + artist + '/related-artists');
          },


          /**
            ====================== Browse =====================
           */
          getFeaturedPlaylists: function (options) {
            return this.api('/browse/featured-playlists', 'GET', options, null, this._auth());
          },

          getNewReleases: function (options) {
            return this.api('/browse/new-releases', 'GET', options, null, this._auth());
          },

          getCategories: function (options) {
            return this.api('/browse/categories', 'GET', options, null, this._auth());
          },

          getCategory: function (category_id, options) {
            return this.api('/browse/categories/' + category_id, 'GET', options, null, this._auth());
          },

          getCategoryPlaylists: function (category_id, options) {
            return this.api('/browse/categories/' + category_id + '/playlists', 'GET', options, null, this._auth());
          },

          getRecommendations: function (options) {
            return this.api('/recommendations', 'GET', options, null, this._auth());
          },

          getAvailableGenreSeeds: function () {
            return this.api('/recommendations/available-genre-seeds', 'GET', null, null, this._auth());
          },


          /**
            ====================== Following =====================
           */
          following: function (type, options) {
            options = options || {};
            options.type = type;
            return this.api('/me/following', 'GET', options, null, this._auth());
          },

          follow: function (type, ids) {
            return this.api('/me/following', 'PUT', { type: type, ids: ids }, null, this._auth());
          },

          unfollow: function (type, ids) {
            return this.api('/me/following', 'DELETE', { type: type, ids: ids }, null, this._auth());
          },

          userFollowingContains: function (type, ids) {
            return this.api('/me/following/contains', 'GET', { type: type, ids: ids }, null, this._auth());
          },

          followPlaylist: function (userId, playlistId, isPublic) {
            return this.api('/users/' + userId + '/playlists/' + playlistId + '/followers', 'PUT', null, {
              public: isPublic || null
            }, this._auth(true));
          },

          unfollowPlaylist: function (userId, playlistId) {
            return this.api('/users/' + userId + '/playlists/' + playlistId + '/followers', 'DELETE', null, null, this._auth());
          },

          playlistFollowingContains: function(userId, playlistId, ids) {
            return this.api('/users/' + userId + '/playlists/' + playlistId + '/followers/contains', 'GET', {
              ids: ids.toString()
            }, null, this._auth());
          },


          /**
            ====================== Library =====================
           */
          getSavedUserTracks: function (options) {
            return this.api('/me/tracks', 'GET', options, null, this._auth());
          },

          userTracksContains: function (tracks) {
            tracks = angular.isString(tracks) ? tracks.split(',') : tracks;
            angular.forEach(tracks, function (value, index) {
              tracks[index] = value.indexOf('spotify:') > -1 ? value.split(':')[2] : value;
            });
            return this.api('/me/tracks/contains', 'GET', {
              ids: tracks.toString()
            }, null, this._auth());
          },

          saveUserTracks: function (tracks) {
            tracks = angular.isString(tracks) ? tracks.split(',') : tracks;
            angular.forEach(tracks, function (value, index) {
              tracks[index] = value.indexOf('spotify:') > -1 ? value.split(':')[2] : value;
            });
            return this.api('/me/tracks', 'PUT', {
              ids: tracks.toString()
            }, null, this._auth());
          },

          removeUserTracks: function (tracks) {
            tracks = angular.isString(tracks) ? tracks.split(',') : tracks;
            angular.forEach(tracks, function (value, index) {
              tracks[index] = value.indexOf('spotify:') > -1 ? value.split(':')[2] : value;
            });
            return this.api('/me/tracks', 'DELETE', {
              ids: tracks.toString()
            }, null, this._auth(true));
          },

          saveUserAlbums: function (albums) {
            albums = angular.isString(albums) ? albums.split(',') : albums;
            angular.forEach(albums, function (value, index) {
              albums[index] = value.indexOf('spotify:') > -1 ? value.split(':')[2] : value;
            });
            return this.api('/me/albums', 'PUT', {
              ids: albums.toString()
            }, null, this._auth());
          },

          getSavedUserAlbums: function (options) {
            return this.api('/me/albums', 'GET', options, null, this._auth());
          },

          removeUserAlbums: function (albums) {
            albums = angular.isString(albums) ? albums.split(',') : albums;
            angular.forEach(albums, function (value, index) {
              albums[index] = value.indexOf('spotify:') > -1 ? value.split(':')[2] : value;
            });
            return this.api('/me/albums', 'DELETE', {
              ids: albums.toString()
            }, null, this._auth(true));
          },

          userAlbumsContains: function (albums) {
            albums = angular.isString(albums) ? albums.split(',') : albums;
            angular.forEach(albums, function (value, index) {
              albums[index] = value.indexOf('spotify:') > -1 ? value.split(':')[2] : value;
            });
            return this.api('/me/albums/contains', 'GET', {
              ids: albums.toString()
            }, null, this._auth());
          },


          /**
            ====================== Personalization =====================
           */
           getUserTopArtists: function (options) {
             options = options || {};
             return this.api('/me/top/artists', 'GET', options, null, this._auth());
           },

           getUserTopTracks: function (options) {
             options = options || {};
             return this.api('/me/top/tracks', 'GET', options, null, this._auth());
           },


          /**
            ====================== Playlists =====================
           */
          getUserPlaylists: function (userId, options) {
            return this.api('/users/' + userId + '/playlists', 'GET', options, null, {
              'Authorization': 'Bearer ' + this.authToken
            });
          },

          getPlaylist: function (userId, playlistId, options) {
            return this.api('/users/' + userId + '/playlists/' + playlistId, 'GET', options, null, this._auth());
          },

          getPlaylistTracks: function (userId, playlistId, options) {
            return this.api('/users/' + userId + '/playlists/' + playlistId + '/tracks', 'GET', options, null, this._auth());
          },

          createPlaylist: function (userId, options) {
            return this.api('/users/' + userId + '/playlists', 'POST', null, options, this._auth(true));
          },

          addPlaylistTracks: function (userId, playlistId, tracks, options) {
            tracks = angular.isArray(tracks) ? tracks : tracks.split(',');
            angular.forEach(tracks, function (value, index) {
              tracks[index] = value.indexOf('spotify:') === -1 ? 'spotify:track:' + value : value;
            });
            return this.api('/users/' + userId + '/playlists/' + playlistId + '/tracks', 'POST', {
              uris: tracks.toString(),
              position: options ? options.position : null
            }, null, this._auth(true));
          },

          removePlaylistTracks: function (userId, playlistId, tracks) {
            tracks = angular.isArray(tracks) ? tracks : tracks.split(',');
            var track;
            angular.forEach(tracks, function (value, index) {
              track = tracks[index];
              tracks[index] = {
                uri: track.indexOf('spotify:') === -1 ? 'spotify:track:' + track : track
              };
            });
            return this.api('/users/' + userId + '/playlists/' + playlistId + '/tracks', 'DELETE', null, {
              tracks: tracks
            }, this._auth(true));
          },

          reorderPlaylistTracks: function (userId, playlistId, options) {
            return this.api('/users/' + userId + '/playlists/' + playlistId + '/tracks', 'PUT', null, options, this._auth(true));
          },

          replacePlaylistTracks: function (userId, playlistId, tracks) {
            tracks = angular.isArray(tracks) ? tracks : tracks.split(',');
            var track;
            angular.forEach(tracks, function (value, index) {
              track = tracks[index];
              tracks[index] = track.indexOf('spotify:') === -1 ? 'spotify:track:' + track : track;
            });
            return this.api('/users/' + userId + '/playlists/' + playlistId + '/tracks', 'PUT', {
              uris: tracks.toString()
            }, null, this._auth(true));
          },

          updatePlaylistDetails: function (userId, playlistId, options) {
            return this.api('/users/' + userId + '/playlists/' + playlistId, 'PUT', null, options, this._auth(true));
          },

          /**
            ====================== Profiles =====================
           */

          getUser: function (userId) {
            return this.api('/users/' + userId);
          },

          getCurrentUser: function () {
            return this.api('/me', 'GET', null, null, this._auth());
          },



          /**
           * Search Spotify
           * q = search query
           * type = artist, album or track
           */
          search: function (q, type, options) {
            options = options || {};
            options.q = q;
            options.type = type;

            return this.api('/search', 'GET', options, null, this._auth());
          },


          /**
            ====================== Tracks =====================
           */
          getTrack: function (track) {
            track = track.indexOf('spotify:') === -1 ? track : track.split(':')[2];

            return this.api('/tracks/' + track);
          },

          getTracks: function (tracks) {
            tracks = angular.isString(tracks) ? tracks.split(',') : tracks;
            angular.forEach(tracks, function (value, index) {
              tracks[index] = value.indexOf('spotify:') > -1 ? value.split(':')[2] : value;
            });
            return this.api('/tracks/', 'GET', {
              ids: tracks ? tracks.toString() : ''
            });
          },

          getTrackAudioFeatures: function (track) {
            track = track.indexOf('spotify:') === -1 ? track : track.split(':')[2];
            return this.api('/audio-features/' + track, 'GET', null, null, this._auth());
          },

          getTracksAudioFeatures: function (tracks) {
            tracks = angular.isString(tracks) ? tracks.split(',') : tracks;
            angular.forEach(tracks, function (value, index) {
              tracks[index] = value.indexOf('spotify:') > -1 ? value.split(':')[2] : value;
            });
            return this.api('/audio-features/', 'GET', {
              ids: tracks ? tracks.toString() : ''
            }, null, this._auth());
          },


          /**
            ====================== Login =====================
           */
          setAuthToken: function (authToken) {
            this.authToken = authToken;
            return this.authToken;
          },

          noLogin: function () {

            var df = $q.defer();

            var crt = 'client_credentials';

            var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64;}else if(isNaN(i)){a=64;}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a);}return t;},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r);}if(a!=64){t=t+String.fromCharCode(i);}}t=Base64._utf8_decode(t);return t;},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128);}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128);}}return t;},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++;}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2;}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3;}}return t;}};

            $http({
              url: 'https://accounts.spotify.com/api/token',
              method: 'POST',
              data: {grant_type : crt},
              //data: data,
              headers: {'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.secret),
                     'Content-Type':'application/x-www-form-urlencoded',
                      'Access-Control-Allow-Origin': '*',
                      //'Accept': 'application/json'


              },
              withCredentials: false
            })
            .then(function (data) {
              return df.resolve(data);
            })
            .catch(function (data) {
              return df.reject(data);
            });
            return df.promise;
          },

          login: function () {
            var deferred = $q.defer();
            var that = this;

            var w = 400,
                h = 500,
                left = (screen.width / 2) - (w / 2),
                top = (screen.height / 2) - (h / 2);

            var params = {
              client_id: this.clientId,
              redirect_uri: this.redirectUri,
              scope: this.scope || '',
              response_type: 'token'
            };

            var authCompleted = false;
            var authWindow = openDialog(
              'https://accounts.spotify.com/authorize?' + this.toQueryString(params),
              'Spotify',
              'menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,width=' + w + ',height=' + h + ',top=' + top + ',left=' + left,
              function () {
                if (!authCompleted) {
                  deferred.reject();
                }
              }
            );

            function storageChanged (e) {
              if (e.key === 'spotify-token') {
                if (authWindow) { authWindow.close(); }
                authCompleted = true;

                that.setAuthToken(e.newValue);
                $window.removeEventListener('storage', storageChanged, false);

                deferred.resolve(e.newValue);
              }
            }

            $window.addEventListener('storage', storageChanged, false);

            return deferred.promise;
          }
        };

        return new NgSpotify();
      }];

    });

}(window, angular));
