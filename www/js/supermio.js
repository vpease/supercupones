/**
 * Created by vpease on 26/03/15.
 */
angular.module('Super',['ngCordova'])

/* Detectar si es movil o desktop */
.factory ('Super',function($cordovaDevice){
    self.mobile='';
    self.usuario='';
    self.prefix='pref';
    var isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i)|| false;
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i)|| false;
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i)|| false;
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i)|| false;
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i)|| false;
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };
    return {
        set: function(){
            self.mobile = isMobile.any();
            console.log ('Es mobile: '+isMobile.any());
        },
        getMobile: function() {
            return self.mobile;
        },
        getLocalNow: function(tipo){
            var fecha = new Date();
            var anio = fecha.getFullYear();
            var dia = fecha.getDate();
            var mes = fecha.getMonth()+1;
            var hora = fecha.getHours();
            var minuto = fecha.getMinutes();
            var segundo = fecha.getSeconds();
            if (dia < 10) dia = '0'+ dia;
            if (mes < 10) mes = '0'+ mes;
            if (hora < 10) hora = '0'+ hora;
            if (minuto < 10) minuto = '0'+ minuto;
            if (segundo < 10) segundo = '0'+ segundo;
            var phoy='';
            if (tipo=='short') {
                phoy = anio.toString() +  mes.toString() + dia.toString() + hora.toString() + minuto.toString() + segundo.toString();
            } else {
                phoy = anio + "/" +  mes + "/" + dia + " " + hora + ":" + minuto + ":" + segundo;
            }
            return phoy;
        },
        getUsuario: function(){
            if (self.usuario==''){
                if (self.mobile){
                    uuid = $cordovaDevice.getUUID();
                    platform = $cordovaDevice.getPlatform();
                    model = $cordovaDevice.getModel();
                    version= $cordovaDevice.getVersion();
                    fecha = this.getLocalNow('long');
                } else {
                    uuid = 'localhost';
                    platform = 'computer';
                    model = 'superlaptop';
                    version= '57';
                    fecha = this.getLocalNow('long');
                }
                self.usuario ={
                    '_id': uuid,
                    'tipo':'user',
                    'fecha': fecha,
                    'platform': platform,
                    'model': model,
                    'version': version
                };
            }
            return self.usuario;
        },
        getLocalId: function(){
            var id = prefix + '_'+this.getUsuario()._id+'_'+this.getLocalNow('short');
            return id;
        }
    }
})

