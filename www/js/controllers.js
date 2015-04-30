/**
 * Created by control on 3/16/2015.
 */
control = angular.module('controllers',['ionic.contrib.ui.tinderCards','services']);
control.controller('StatusCtrl',function($scope,$timeout,Cupones){
    $scope.cordovaStatus = Cupones.CordovaStatus();
    $scope.posicionStatus = Cupones.PositionStatus();
    $scope.dataStatus = Cupones.DataStatus();
    $scope.replicateStatus = Cupones.ReplicateStatus();

    $scope.updateStatus= function(){
        $scope.cordovaStatus = Cupones.CordovaStatus();
        $scope.posicionStatus = Cupones.PositionStatus();
        $scope.dataStatus= Cupones.DataStatus();
        $scope.replicateStatus = Cupones.ReplicateStatus();
    };
    refrescar = function(){
        var timeout=1000;
        if (!($scope.cordovaStatus && $scope.posicionStatus && $scope.dataStatus && $scope.replicateStatus))
        $timeout(function(){
            $scope.updateStatus();
            console.log('Actualizando controlador');
            if (!Cupones.fase0completed()){
                this.refrescar();
            }
        },timeout);
    };
    refrescar();
});
control.controller('AppCtrl',function($scope){
    $scope.alertar=function(){
        alert('Click');
    }
});
control.controller('MainCtrl',function($scope,TDCardDelegate,Cupones,cards){
    /*var cardTypes =[
        {image: 'img/pic2.jpg',title:'So much grass #hippster'},
        {image: 'img/pic3.jpg',title:'Way too much sand, right?'},
        {image: 'img/pic4.jpg',title:'Beatiful sky from wherever'}
    ];*/
    var cardTypes = cards;
    $scope.cardsLoaded = false;
    $scope.position= Cupones.getLocation();
    $scope.cards = [];
    $scope.saltar = function(){
        var card = TDCardDelegate.getSwipeableCard($scope);
        card.swipe();
    };
    $scope.cardSwipedLeft = function(index){
        console.log('Left swipe');
        Cupones.putLocalPref('dislike',cardTypes[index].doc);
    };
    $scope.cardSwipedRight = function(index){
        console.log('Right swipe');
        Cupones.putLocalPref('like',cardTypes[index].doc);
    };
    $scope.cardDestroyed = function(index){
        $scope.cards.splice(index,1);
        console.log('Card removed');
        console.log('quedan en el deck: '+ TDCardDelegate.length);
        Cupones.getUltimos(0,1).then(function(result){
            cardTypes = result;
            getCover();
        });
    };
    $scope.transitionOut = function(card) {
        console.log('card transition out');
    };
    $scope.transitionRight = function(card) {
        console.log('card removed to the right');
        console.log(card.title);
    };
    $scope.transitionLeft = function(card) {
        console.log('card removed to the left');
        console.log(card.title);
    };
    $scope.cardPartialSwipe = function(amt){
        console.log('Swipe parcial: '+amt);
    };
    $scope.addCard = function(i){
        //var newCard = cardTypes[Math.floor(Math.random()* cardTypes.length)];
        var newCard = cardTypes[i].doc;
        newCard.id = newCard._id;
        Cupones.putLocalPref('show',cardTypes[i].doc);
        $scope.cards.push(angular.extend({},newCard));
    };
    $scope.addCard = function(object){
        //var newCard = cardTypes[Math.floor(Math.random()* cardTypes.length)];
        var newCard = object.doc;
        Cupones.putLocalPref('show',object.doc);
        $scope.cards.push(angular.extend({},newCard));
        $scope.cardsLoaded = true;
    };
    getCover = function(){
        angular.forEach(cardTypes,function(card){
            Cupones.getAttach(card.doc._id,Object.keys(card.doc._attachments)[0])
                .then (function (result){
                card.doc.image=result;
                $scope.addCard(card);
                //console.log(result);
                //console.log('cover del comic cargado');

            },function (error){
                console.log('problemas con el cover del comic')
            });
        });
        /*for(var i=0;i<cardTypes.length;i++) {
            $scope.addCard(i)
        }*/
    };
    getCover();

});