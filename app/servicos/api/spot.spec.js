describe('Test Spot Factory', function() {
  var spotTest, $q, $httpBackend, spotifyTest, $scope, deferred, provider;

  //var API = 'http://localhost:3000/social';

  //Mock Resposta API
  var RESPONSE_SUCCESS = {
    data:{
      data:{
        'id': 1,
        'total': 14
      }
    }

  };

  var RESPONSE_UNDEFINED = {
    'id': undefined,
  };

  var RESPONSE_UNAUTHORIZED = {
    'status': '401',
    'message': 'No token provided'
  };


  beforeEach(angular.mock.module('api.spot'));
  beforeEach(angular.mock.module('spotify'));

  beforeEach(inject(function(spot, _$q_, _$httpBackend_, Spotify, _$rootScope_) {
    spotTest = spot;
    $q = _$q_;
    $httpBackend = _$httpBackend_;
    spotifyTest = Spotify;
    $scope = _$rootScope_.$new();
    deferred = _$q_.defer();

  }));

  it('Service exists?', function() {
    expect(spotTest).toBeDefined();
  });

  describe('getAlbumsByArtistId()', function() {
     var result;

     beforeEach((function() {
         result = {};
         spyOn(spotTest, "getAlbumsByArtistId").and.callThrough();
     }));

   it('Return Undefined', function() {
       var id = '';
       var result = {};

       $httpBackend.whenGET(id).respond(200, RESPONSE_UNDEFINED);

       expect(spotTest.getAlbumsByArtistId).not.toHaveBeenCalled();
       expect(result).toEqual({});

       spotTest.getAlbumsByArtistId(id)
       .then(function(res) {
        result = res;
      });

      $httpBackend.flush();

       //console.log("Result - Test 1: ", result.data);

       expect(spotTest.getAlbumsByArtistId).toHaveBeenCalledWith(id);
       expect(result.data.id).toBeUndefined();

   });

   it('Pass a valid Artist Id and Return an Album', function() {
     var id = '0MDyxNYI11EEQWhjsrPFd2';

     //$httpBackend.whenGET('https://api.spotify.com/v1/artists/0MDyxNYI11EEQWhjsrPFd2/albums').passThrough();
     $httpBackend.whenGET('https://api.spotify.com/v1/artists/0MDyxNYI11EEQWhjsrPFd2/albums').respond(200, RESPONSE_SUCCESS);

     expect(spotTest.getAlbumsByArtistId).not.toHaveBeenCalled();
     expect(result).toEqual({});

     spotTest.getAlbumsByArtistId(id).then(function(res) {
       //console.log("Res: ", res.data.data);
       result = res.data.data;

     });

     $httpBackend.flush();

     //console.log("Result - Test 2: ", result.data.total);

     expect(spotTest.getAlbumsByArtistId).toHaveBeenCalledWith(id);
     expect(result.data.total).toBeGreaterThan(1);

  });

});

  describe('search()', function() {
     var result;
     var store = {};

     beforeEach((function() {
         result = {};
         spyOn(spotTest, "search").and.callThrough();
         // LocalStorage mock.
         spyOn(localStorage, 'getItem').and.callFake(function(key) {
             return store[key];
         });
         Object.defineProperty(localStorage, "setItem", { writable: true });
         spyOn(localStorage, 'setItem').and.callFake(function(key, value) {
             store[key] = value;
         });

     }));

   it('401 Unauthorized', function() {
     var opt = '{}';
     var query = '';
     var type = "artist,album";
     var result = {};

     $httpBackend.whenGET('https://api.spotify.com/v1/search?query=laura&type=artist,album').respond(401, $q.when(RESPONSE_UNAUTHORIZED));

     expect(spotTest.search).not.toHaveBeenCalled();
     expect(result).toEqual({});

     spotTest.search(query, type, opt)
     .catch(function(res) {
      result = {'status': 401,'message': 'No token provided'};
      //console.log("Erro: ", result);
    });

     $scope.$digest();

     //$httpBackend.flush();

     //console.log("Result - Test 3: ", result);

     expect(spotTest.search).toHaveBeenCalledWith(query,type, opt);
     expect(result.status).toEqual(401);

   });

   it('Return Undefined', function() {
     var opt = '{}';
     var query = 'laura';
     var type = "artist,album";
     var result = {};

     //Change here if token expire
     localStorage.setItem('spotify-token', 'BQBVWeIhssD2NgvU3Gp5eWi7U6WucEEXeeBFMLTHr6u95QHEv0T5ybUzf7E1gwYLRhrTPjNeJwi8i0YUkpdvLJUbm9QIMUh47JYaTy9I3H0i5lOFx5TuQAVUCOVxF1nBmT_4WO3Z3CKPKrByl5Td_jFg1hdYCEMKdGK13aUPpU_As0bUVn5veaDMcn6oGWVhzmJkpRrj9SbdYM0RKSoZ2L4tpw3QQFd_ymFbVuCL0DFoa5f4DrzLqsxA3--dL2TjXhc');

     //console.log('Token: ', localStorage.getItem('spotify-token'));

     $httpBackend.expectGET('https://api.spotify.com/v1/search?q=laura&type=artist,album', undefined, {
       Authorization: 'Bearer ' + localStorage.getItem('spotify-token')
       //Accept: "application/json;odata=verbose"
    }).respond(200, RESPONSE_UNDEFINED);

     expect(spotTest.search).not.toHaveBeenCalled();
     expect(result).toEqual({});

     spotTest.search(query, type, opt)
     .then(function(res) {
      result = res;
    });

     //$scope.$digest();

     $httpBackend.flush();

     //console.log("Result - Test 4: ", result.data);

     expect(spotTest.search).toHaveBeenCalledWith(query, type, opt);
     expect(result.data.id).toBeUndefined();

   });

   it('Pass a valid term and returns a Albums and Artist objetcs', function() {
     var opt = '{}';
     var query = 'laura';
     var type = "artist,album";
     var result = {};

     $httpBackend.expectGET('https://api.spotify.com/v1/search?q=laura&type=artist,album', undefined, {
       Authorization: 'Bearer ' + localStorage.getItem('spotify-token')
       //Accept: "application/json;odata=verbose"
    }).respond(200, RESPONSE_SUCCESS);

     expect(spotTest.search).not.toHaveBeenCalled();
     expect(result).toEqual({});

     spotTest.search(query, type, opt).then(function(res) {
       //console.log("Res: ", res.data.data);
       result = res.data.data;

     });

     $httpBackend.flush();

     //console.log("Result - Test 5: ", result.data.total);

     expect(spotTest.search).toHaveBeenCalledWith(query, type, opt);
     expect(result.data.total).toBeGreaterThan(1);

  });

});

describe('searchOpt()', function() {
   var result;
   var store = {};

   beforeEach((function() {
       result = {};
       spyOn(spotTest, "searchOpt").and.callThrough();
       // LocalStorage mock.
       spyOn(localStorage, 'getItem').and.callFake(function(key) {
           return store[key];
       });
       Object.defineProperty(localStorage, "setItem", { writable: true });
       spyOn(localStorage, 'setItem').and.callFake(function(key, value) {
           store[key] = value;
       });

   }));

   it('401 Unauthorized', function() {
     var opt = '{}';
     var query = '';
     var type = "artist,album";
     var limit = 20;
     var offset = 20;
     var result = {};

     $httpBackend.whenGET('https://api.spotify.com/v1/search?query=laura&type=artist,album&offset=20&limit=20').respond(401, $q.when(RESPONSE_UNAUTHORIZED));

     expect(spotTest.searchOpt).not.toHaveBeenCalled();
     expect(result).toEqual({});

     spotTest.searchOpt(query, type, limit, offset)
     .catch(function(res) {
      result = {'status': 401,'message': 'No token provided'};
      //console.log("Erro: ", result);
    });

     $scope.$digest();

     //$httpBackend.flush();

     //console.log("Result - Test 6: ", result);

     expect(spotTest.searchOpt).toHaveBeenCalledWith(query, type, limit, offset);
     expect(result.status).toEqual(401);

   });

   it('Return Undefined', function() {
     var opt = '{}';
     var query = 'laura';
     var type = "artist,album";
     var limit = 20;
     var offset = 20;
     var result = {};

     $httpBackend.expectGET('https://api.spotify.com/v1/search?q=laura&type=artist,album&limit=20&offset=20', undefined, {
       Authorization: 'Bearer ' + localStorage.getItem('spotify-token')
       //Accept: "application/json;odata=verbose"
    }).respond(200, RESPONSE_UNDEFINED);

     expect(spotTest.searchOpt).not.toHaveBeenCalled();
     expect(result).toEqual({});

     spotTest.searchOpt(query, type, limit, offset)
     .then(function(res) {
      result = res;
    });

     //$scope.$digest();

     $httpBackend.flush();

     //console.log("Result - Test 7: ", result.data);

     expect(spotTest.searchOpt).toHaveBeenCalledWith(query, type, limit, offset);
     expect(result.data.id).toBeUndefined();

   });

   it('Pass a valid term and returns a Albums and Artist objetcs', function() {
     var opt = '{}';
     var query = 'laura';
     var type = "artist,album";
     var limit = 20;
     var offset = 20;
     var result = {};

     $httpBackend.expectGET('https://api.spotify.com/v1/search?q=laura&type=artist,album&limit=20&offset=20', undefined, {
       Authorization: 'Bearer ' + localStorage.getItem('spotify-token')
       //Accept: "application/json;odata=verbose"
    }).respond(200, RESPONSE_SUCCESS);

     expect(spotTest.searchOpt).not.toHaveBeenCalled();
     expect(result).toEqual({});

     spotTest.searchOpt(query, type, limit, offset).then(function(res) {
       //console.log("Res: ", res.data.data);
       result = res.data.data;

     });

     $httpBackend.flush();

     //console.log("Result - Test 7: ", result.data.total);

     expect(spotTest.searchOpt).toHaveBeenCalledWith(query, type, limit, offset);
     expect(result.data.total).toBeGreaterThan(1);

  });

});

});
