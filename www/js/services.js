var service = angular.module('services', ['db','ngCordova','Super']);

/**
 * A simple example service that returns some data.
 */
service.factory('Cupones', function($q,$cordovaGeolocation,$rootScope,$timeout,$location,DB,Super) {
    self.CordovaReady = false;
    self.LocReady = false;
    self.DataReady = false;
    self.ReplicateReady = false;
    self.ReplicateComplete = false;
    self.usuario=''

    var cats = [
        { _id: 'cat1', tipo: 'catalogo', avatar: 'img/cats/avatar01.png', class:'cat01', name: 'Marvel', image:'img/cats/cat01.png', color: 'red'},
        { _id: 'cat2', tipo: 'catalogo', avatar: 'img/cats/avatar02.png', class:'cat02', name: 'DC',image:'img/cats/cat02.png', color: 'blue' },
        { _id: 'cat3', tipo: 'catalogo', avatar: 'img/cats/avatar03.png', class:'cat03', name: 'Image',image:'img/cats/cat03.png', color: 'yellow' },
        { _id: 'cat4', tipo: 'catalogo', avatar: 'img/cats/avatar04.png', class:'cat04', name: 'Dark Horse',image:'img/cats/cat04.png', color: 'cyan' },
        { _id: 'cat5', tipo: 'catalogo', avatar: 'img/cats/avatar05.png', class:'cat05', name: 'Peru21',image:'img/cats/cat05.png', color: 'white' },
        { _id: 'cat6', tipo: 'catalogo', avatar: 'img/cats/avatar06.png', class:'cat06', name: 'VUK',image:'img/cats/cat06.png', color: 'black' },
          { _id: 'cat7', tipo: 'catalogo', avatar: 'img/cats/avatar07.png', class:'cat07', name: 'Skecthboy',image:'img/cats/cat07.png', color: 'white' }
      ];
    var location={};
  return {
      CordovaStatus: function(){
          return self.CordovaReady;
      },
      PositionStatus: function(){
          return self.LocReady;
      },
      DataStatus: function(){
          return self.DataReady;
      },
      ReplicateStatus: function(){
          return self.ReplicateComplete;
      },
      setDataStatus: function(status){
          self.DataReady=status;
      },
      getLocation: function(){
          return location;
      },
      setCordovaStatus: function(status){
          if (status=="true"){
              self.CordovaReady = true;
          }
      },
      setReplicateStatus: function(status){
          self.ReplicateComplete=status;
      },
      fase0completed: function(){
          console.log('Estado de cordova es: '+self.CordovaReady);
          console.log('Estado de Posición es: '+self.LocReady);
          console.log('Estado de Datos es: '+self.DataReady);
          console.log('Estado de Replicación es: '+self.ReplicateComplete);
          return (self.CordovaReady && self.LocReady && self.DataReady && self.ReplicateComplete);
      },
      setLocationStatus: function(status){
          self.LocReady = status;
      },
      setLocation: function(){
		  //alert('El valor de CordovaReady es: '+JSON.stringify(CordovaReady));
          if (self.CordovaReady) {
			  //alert('Dentro de  CordovaReady es: '+JSON.stringify(CordovaReady));
              var options = {
                  timeout: 10000,
                  enableHighAccuracy: false
              };
              $cordovaGeolocation
                  .getCurrentPosition(options)
                  .then(function(position){
                      location = position;
                      $timeout(function(){
                          console.log('posición conseguida: '+ JSON.stringify(position));
                          $rootScope.$broadcast('init:position');
                          $rootScope.$apply();
                      });
                  },function(err){
                      console.log('Error en posicion: '+JSON.stringify(err));
                  })
          };
          //alert('Ubicación final: '+JSON.stringify(location));
      },
      getUsuario: function(){
          if (self.usuario==''){
              self.usuario = Super.getUsuario();
          };
          return self.usuario;
      },
      data: function(){
          DB.init(this.getUsuario());
      },
      replicate: function() {
          DB.replicate();
          self.ReplicateReady= true;
      },
      fase1iniciar: function(){
          if (this.fase0completed()){
              $location.path('/app/main');
              $rootScope.$apply();
              //if (!self.ReplicateReady) this.replicate();
          };
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
      getUltimos: function(salto,limite){
          var dfd = $q.defer();
          DB.getView('cupones/ultimos',{skip: salto,limit:limite,descending:false,include_docs:true})
              .then(function(result){
                  console.log('Recuperando ultimos');
                  dfd.resolve(result);
              },function(error){
                  console.log('Error en getUltimos: '+error);
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
      putLocalPref: function(state,object){
          var history='';
          if (state=='show'){
              object.tipo="preferencia";
              object.cupon =object._id;
              object._id = Super.getLocalId();
              object.group = 'user';
              object.user = this.getUsuario()._id;
              object.state = 'show';
              object.history =[];
              history = {'state':'show','time':Super.getLocalNow('short')};
          }
          if (state=='like'){
              object.state = 'like';
              history = {'state':'like','time':Super.getLocalNow('short')};
          }
          if (state=='dislike'){
              object.state = 'like';
              history = {'state':'like','time':Super.getLocalNow('short')};
          }
          object.history.push(history);
          this.put(object);
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
