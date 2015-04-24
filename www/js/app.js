// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('supercupones', ['ionic','controllers','services','ngCordova']);
app.run(function($ionicPlatform,$location,$cordovaBackgroundGeolocation,Cupones) {
    $ionicPlatform.ready(function() {
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }
        console.log("App is ready!!");
        window.localStorage['cordovaready']='true';
        Cupones.setCordovaStatus(window.localStorage['cordovaready']);
        console.log('Cordova listo!!!!');
        Cupones.data();
        try{
            Cupones.setLocation();
        } catch (error){
            console.log('Error en la captura de localización'+ JSON.stringify(error));
        };
    });
});
app.run(function($rootScope,$location,Cupones){
    $rootScope.$on('dbinit:uptodate',function(){
        Cupones.setDataStatus(true);
        ready = window.localStorage['cordovaready']||'false';
        console.log('Terminó la syncronizacion de diseño y ahora cordova es:'+ ready);

        /*while (ready=='false') {
            ready = window.localStorage['cordovaready']||'false';
            console.log('Esperando a Cordova!!');
        }*/
        Cupones.replicate();
        Cupones.fase1iniciar();
    });
    $rootScope.$on('init:position',function(){
        console.log('Position listo!!!!!');
        Cupones.setLocationStatus(true);
        Cupones.fase1iniciar();
    });
    $rootScope.$on('db:uptodate',function(){
        console.log('Terminó la syncronizacion de datos');
        Cupones.setReplicateStatus(true);
        Cupones.fase1iniciar();
    });
});

app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('status',{
            url: "/status",
            templateUrl:"templates/status.html",
            controller: "StatusCtrl"
        })
        .state('app', {
            url: "/app",
            abstract: true,
            templateUrl: "templates/menu.html",
            controller: 'AppCtrl'
        })
        .state('app.main', {
            url: "/main",
            views: {
                'menuContent': {
                    templateUrl: "templates/main.html",
                    controller: 'MainCtrl'
                }
            },
            resolve:{
                cards: function(Cupones){
                    res = Cupones.getUltimos(0,1);
                    return res;
                }
            }
        });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/status');
});