Music Search

[Pre-Requisites]

> Install HTTP-SERVER
  npm install -g http-server

> change spotify information if necessary
  Where? open js file music-search->app->app.js
  Changes lines below (lines 17, 18 and 20):
     SpotifyProvider.setClientId('f06adbfb247d41beafe88dc4c8d89f3e');
	 SpotifyProvider.setRedirectUri('http://localhost:8089/templates/callback.html');
	 SpotifyProvider.setScope('');


[Development]
I have used:

UI - BootStrap
Front End: Angular JS
Plus: 1. Angular-Spotify Service
      2. Spot Service Factory
			3. angular-busy (Show ajax loading icon)
			4. angular-modal-service
			5. Font Awesome
			6. LocalStorage

[Test]
I have used: Jasmine + Karma

[Build Deploy]
I have used: Gulp

 > From root folder [music-search]
 Run:

 [Install]
 npm install

 [Run Test]

 [Before Start Test Karma]
 Inside music-search->app->servicos->api->spot.spec.js
 Change line 154 with the new spotify client token

 localStorage.setItem('spotify-token', new_spotify_client_token);

 and then run the command below

 npm test

 [Run Build/Deploy]
 npm run build

 > From dist folder [music-search/dist]

 [Run HTTP-SERVER]

 http-server -p 8089
