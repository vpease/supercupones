var service = angular.module('services', ['db','ngCordova'])

/**
 * A simple example service that returns some data.
 */
service.factory('Cupones', function($q,$cordovaBackgroundGeolocation,DB) {
    var CordovaReady=false;
    var LocReady=false;
    var cats = [
        { _id: 'cat1', tipo: 'catalogo', avatar: 'img/cats/avatar01.png', class:'cat01', name: 'Marvel', image:'img/cats/cat01.png', color: 'red'},
        { _id: 'cat2', tipo: 'catalogo', avatar: 'img/cats/avatar02.png', class:'cat02', name: 'DC',image:'img/cats/cat02.png', color: 'blue' },
        { _id: 'cat3', tipo: 'catalogo', avatar: 'img/cats/avatar03.png', class:'cat03', name: 'Image',image:'img/cats/cat03.png', color: 'yellow' },
        { _id: 'cat4', tipo: 'catalogo', avatar: 'img/cats/avatar04.png', class:'cat04', name: 'Dark Horse',image:'img/cats/cat04.png', color: 'cyan' },
        { _id: 'cat5', tipo: 'catalogo', avatar: 'img/cats/avatar05.png', class:'cat05', name: 'Peru21',image:'img/cats/cat05.png', color: 'white' },
        { _id: 'cat6', tipo: 'catalogo', avatar: 'img/cats/avatar06.png', class:'cat06', name: 'VUK',image:'img/cats/cat06.png', color: 'black' },
          { _id: 'cat7', tipo: 'catalogo', avatar: 'img/cats/avatar07.png', class:'cat07', name: 'Skecthboy',image:'img/cats/cat07.png', color: 'white' }
      ];
    var location={
        url: 'http://only.for.android.com/update_location.json', // <-- Android ONLY:  your server url to send locations to
        params: {
            auth_token: 'user_secret_auth_token',    //  <-- Android ONLY:  HTTP POST params sent to your server when persisting locations.
            foo: 'bar'                              //  <-- Android ONLY:  HTTP POST params sent to your server when persisting locations.
        },
        notificationTitle: 'Background tracking', // <-- android only, customize the title of the notification
        notificationText: 'ENABLED', // <-- android only, customize the text of the notification
        activityType: 'AutomotiveNavigation',
        bearing:"0.0",
        longitude: "",
        recorded_at:"2015-03-20T02:36Z",
        latitude: "",
        speed:"0.0",
        accuracy:"30.0",
        altitude:"0.0",
        stopOnTerminate: "true"
    };
  return {
      getLocation: function(){
          return location;
      },
      setCordova: function(status){
          if (status=="true"){
              CordovaReady = true;
          }
      },
      setLocation: function(){
		  alert('El valor de CordovaReady es: '+JSON.stringify(CordovaReady));
          if (CordovaReady) {
			  alert('Dentro de  CordovaReady es: '+JSON.stringify(CordovaReady));
              var options = {
                  desiredAccuracy: 100,
                  stationaryRadius: 500,
                  debug: false
              };
              $cordovaBackgroundGeolocation.configure(options)
                  .then(null,
                  function(err){
                      console.log('error en la location');
                      alert('Ubicación KO');
                  },
                  function(ploc){
                      location = ploc;
                      console.log('Posicion encontrada: '+ JSON.stringify(location));
                      LocReady = true;
                      alert('Ubicación Ok: '+JSON.stringify(location));
                      $cordovaBackgroundGeolocation.stop();
                  });
          };
          alert('Ubicación final: '+JSON.stringify(location));
      },
      data: function(){
          DB.init();
      },
      replicate: function() {
          DB.replicate();
      },
      getDB: function(key){
          var dfd = $q.defer();
          DB.get(key)
              .then(function(result){
                  console.log('Recuperando un documento');
                  dfd.resolve(result);
              },function(error){
              console.log('Error en get'+error);
          });
          return dfd.promise;
      },
      getCatalogos: function(){
          var dfd = $q.defer();
          DB.getAll({startkey: 'cat',endkey:'cat\uffff',include_docs:true})
              .then(function(result){
                  console.log('Recuperando catálogos');
                  dfd.resolve(result);
              },function(error){
                  console.log('Error en getCatalogos: '+error);
              });
          return dfd.promise;
      },
      getColecciones: function(catid){
          var dfd = $q.defer();
          DB.getView('comics/colecciones',{startkey:[catid,{}],endkey:[catid], include_docs:true,descending:true})
              .then(function(result){
                  console.log('Recuperando colecciones');
                  dfd.resolve(result);
              },function(error){
                  console.log('Error en getColecciones:'+error);
              });
          return dfd.promise;
      },
      getUltimos: function(salto,limite){
          var dfd =$q.defer();
          DB.getView('comics/ultimos',{skip:salto, limit:limite, descending:true,include_docs:true})
              .then(function(result){
                  console.log('Recuperando Ultimos');
                  dfd.resolve(result);
              },function(error){
                  console.log('Error en getUltimo:'+error);
              });
          return dfd.promise;
      },
      getComs: function(colid){
          var dfd = $q.defer();
          stkey ='com_'+colid+'_';
          enkey = stkey+'\uffff';
          DB.getAll({startkey:stkey,endkey:enkey,include_docs:true})
              .then(function(result){
                  console.log('Recuperando comics');
                  dfd.resolve(result);
              },function(error){
                  console.log('Error en getComs'+error);
              });
          return dfd.promise;
      },
      getBarcode: function(barcode){
          var dfd =$q.defer();
          DB.getView('comics/barcode',{startkey:[barcode],endkey:[barcode,{}],descending:true,group:true})
              .then(function(result){
                  console.log('Recuperando Barcode');
                  dfd.resolve(result);
              },function(error){
                  console.log('Error en Barcode:'+error);
              });
          return dfd.promise;
      },
      getAttach: function(key,attach){
          var dfd = $q.defer();
          DB.getAttach(key,attach)
              .then(function(result){
                  //console.log('Cargar blob');
                  url = window. URL || window.webkitURL;
                  res = url.createObjectURL(result);
                  dfd.resolve(res);
              },function(error){
                  console.log('Error cargando blob:' + error);
              });
          return dfd.promise;
      },
      put: function(object){
          DB.put(object);
      },
      all: function() {
          var dfd = $q.defer();
          res = cats;
          dfd.resolve(res);
          return dfd.promise;
      },
      get: function(catId) {
          var dfd = $q.defer();
          angular.forEach(cats,function(cat){
              if (cat._id == catId){
                  res = cat;
              }
          });
          dfd.resolve(res);
          return dfd.promise;
      }
  }
});
