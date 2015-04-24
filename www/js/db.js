/**
 * Created by vpease on 20/12/2014.
 */
var data=angular.module('db',[]);

data.factory('DB',function($q,$rootScope) {
    var self = this;
    self.db;
    self.key = 'allycdowerstrowstenterea';
    self.pass = 'nXYslAm4kCISa2iT7kDwHlme'
    self.remoteserver = 'http://'+self.key+':'+self.pass+'@'+'supercupones.supermio.com/';
    self.dbname = '';
    self.localdb = 'supercupones';
    self.usuario = '';
    self.init = function(usuario) {
        self.usuario = usuario;
        if (!self.db) {
            console.log('database is closed');
            self.db = new PouchDB(self.localdb,{
                adapter: 'websql',
                size: 50,
                auto_compaction:true});
            if (!self.db.adapter){
                self.db  = new PouchDB(self.localdb,{
                    size: 50,
                    auto_compation: true
                });
                console.log('Usando: ' + self.db.adapter);
            } else {
                console.log('Usando :'+ self.db.adapter);
            }
            self.db.compact({},function(){
                console.log('db compactada');
                self.put(self.usuario);
                $rootScope.$broadcast('dbinit:uptodate');
                $rootScope.$apply();
            });
            PouchDB.debug.enable('*');

            //self.initial();
            // console.log('ya se grabó');
        }
    };
    self.initial = function(){
        window.localStorage['cargando']="false";
        window.localStorage['cont']=0;
        var datos = window.localStorage['datos']|'0';
        console.log('verificando si hay datos cargados:'+datos);
        if (datos=='0'){
            console.log('Entrando a la carga de data.txt');
            var dumpFiles = ['data_00000000.txt','data_00000001.txt','data_00000002.txt','data_00000003.txt','data_00000004.txt','data_00000005.txt','data_00000006.txt'];
            var series = PouchDB.utils.Promise.resolve();
            var cont = 0;
            dumpFiles.forEach(function (dumpFile) {
                console.log('Cargando archivo: '+dumpFile);
                self.db.load('data/' + dumpFile,{proxy: self.remoteserver})
                    .then(function(){
                        cont+=1;
                        window.localStorage['cont']=cont;
                        console.log('archivo ok: '+dumpFile + ' contador: '+window.localStorage['cont']);
                        if (window.localStorage['cont'] == dumpFiles.length) {
                            console.log('archivo final');
                            window.localStorage['datos']='1';
                            $rootScope.$broadcast('dbinit:uptodate');
                        }
                    })
                    .catch(function(err){
                        console.log('Error al cargar: '+dumpFile+ ' '+JSON.stringify(err));
                    })
            });
        } else {
            if (window.localStorage['cargando']!=="true") {
                console.log('La carga no fue necesaria');
                $rootScope.$broadcast('dbinit:uptodate');
            }
        }
    };
    self.replicate = function(){
        console.log('Iniciando la replicación');
        var remote =self.remoteserver+self.dbname;
        console.log('servidor remoto es: '+remote);
        var info;
        self.db.info().then(function(result){
            info = result;
            console.log('db local es: '+ JSON.stringify(info));
        }).catch(function(err){
            console.log('Error en la db.info '+ err);
        });

        var sync = self.db.replicate.from(
            remote,
            {live:false, retry:true, filter:"cupones/per_user", query_params: {'agent':'vpease'}})
            .on('paused',function(info){
                console.log('Estoy en el estado paused');
                //$rootScope.$broadcast('db:uptodate');
            })
            .on('change',function(info){
                console.log('Cambios en la base de datos'+JSON.stringify(info));
            })
            .on('complete',function(info){
                var timeout = 60000;
                console.log('Sync data complete'+JSON.stringify(info));
                if (info.docs_written>0) timeout=600000;
                setTimeout(function(){
                    console.log('sync nuevamente');
                    self.replicate();
                },timeout);
                $rootScope.$broadcast('db:uptodate');
            })
            .on('uptodate',function(info){
                console.log('Actualizado datos'+JSON.stringify(info));
                //$rootScope.$broadcast('db:uptodate');
            })
            .on('error',function(err){
                console.log('Error en sync datos: '+JSON.stringify(err));
            })
    };
    self.getView = function(view,options){
        return self.db.query(view,options);
    };
    self.getAll = function(query){
        return self.db.allDocs(query);
    };
    self.remove = function (key){
        self.db.remove(key,function(err,response){
            if (err){
                console.log(err);
            } else {
                console.log(response);
            }
        });
    };
    self.get = function(key){
        return self.db.get(key);
    };
    self.getAttach = function(key,attach){
        return self.db.getAttachment(key,attach);
    };
    self.put = function(object){
        if (!self.db){
            self.init();
        }
        self.db.get(object._id,function(err,doc){
            if (!err){
                if (doc){
                    object._rev = doc._rev;
                    doc = object;
                    self.db.put(doc).then(function(response){
                        console.log('Update Ok');
                    }).catch(function(error){
                        console.log('Error en Update:'+error.toString());
                    });
                } else {
                    self.db.put(object).then(function(response){
                        console.log('Insert Ok');
                    }).catch(function(error){
                        console.log('Error al insertar: '+error.toString());
                    });
                }
            } else {
                if (err.status==404){
                    self.db.put(object).then(function(response){
                        console.log('Insert Ok');
                    }).catch(function(error){
                        console.log('Error al insertar: '+error.toString());
                    });
                } else {
                    console.log("Error: "+err);
                }
            }
        });
    };
    self.bulk = function(objects){
        if (!self.db){
            self.init();
        }
        self.db.bulkDocs(objects,{new_edits:true},function(err,response){
            if (!err){
                console.log('Todo ok con el bulk: '+response.toString());
            } else {
                console.log('Error:'+ err.toString());
            }
        });
    };
    return self;
});