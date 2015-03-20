/**
 * Created by control on 3/16/2015.
 */
control = angular.module('controllers',['ionic.contrib.ui.tinderCards']);
control.controller('AppCtrl',function($scope){
    $scope.alertar=function(){
        alert('Click');
    }
});
control.controller('MainCtrl',function($scope,TDCardDelegate){
    var cardTypes =[
        {image: 'img/pic2.jpg',title:'So much grass #hippster'},
        {image: 'img/pic3.jpg',title:'Way too much sand, right?'},
        {image: 'img/pic4.jpg',title:'Beatiful sky from wherever'}
    ];
    $scope.cards = [];
    $scope.saltar = function(){
        var card = TDCardDelegate.getSwipeableCard($scope);
        card.swipe();
    };
    $scope.cardSwipedLeft = function(index){
        console.log('Left swipe');
        alert('Left');
    };
    $scope.cardSwipedRight = function(index){
        console.log('Right swipe');
        alert('Right');
    };
    $scope.cardDestroyed = function(index){
        $scope.cards.splice(index,1);
        console.log('Card removed');
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
        var newCard = cardTypes[i];
        newCard.id = Math.random();
        $scope.cards.push(angular.extend({},newCard));
    };
    for(var i=0;i<3;i++) $scope.addCard(i);
});