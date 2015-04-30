/**
 * Created by control on 27/04/2015.
 */
var service = angular.module('Cupon', ['db']);
service.factory("Cupon",function(DB) {
        var object;
        // Cupón es preferencia, cupón o volante
        function Cupon( object ) {
            this.object = object;
        }
        Cupon.prototype = {
            isCupon: function() {
                return (this.object.doc.tipo == "cupon");
            },
            isPreferencia: function(){
                return (this.object.doc.tipo == "preferencia");
            },
            isUsed: function() {
                var res=false;
                if (this.object.doc.tipo=="preferencia"){
                    if (this.object.doc.history.length=2) res = true;
                }
                return(res);
            },
            getObject: function(){
                return this.object;
            },
            getCuponID: function(){
                var res='';
                if (this.object.doc.tipo=="preferencia") res = this.object.doc.cupon;
                if (this.object.doc.tipo=="cupon") res = this.object.doc._id;
                return (res);
            },
            getAttachments: function(){
                return (Object.keys(this.object.doc._attachments)[0]);
            },
            setImage: function(image){
                this.object.doc.image = image;
            }
        };

        return(Cupon);
    }
);

