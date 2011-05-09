var HovercraftFactory = require('./hovercraftfactory').HovercraftFactory;
var HovercraftController = require('./hovercraftcontroller').HovercraftController;
var ChaseCamera = require('./chasecamera').ChaseCamera;

ClientCommunication = function(app){
    this.app = app;
    this.started = false;
    this.socket = new io.Socket();
    this.hookSocketEvents();    
    this.socket.connect(); 
    this._hovercraftFactory = new HovercraftFactory(app);
    this.dispatcher = new MessageDispatcher();
    this.dispatcher.addReceiver(new ClientGameReceiver(this.app.scene));    
};

ClientCommunication.prototype.hookSocketEvents = function() {
    var game = this;
    this.socket.on('connect', function(){        game.onConnected();     });
    this.socket.on('message', function(msg){     game.dispatchMessage(msg);   });
    this.socket.on('disconnect', function(){     game.onDisconnected(); });    
};

ClientCommunication.prototype.onConnected = function() {
  this.sendMessage('ready');  
};

ClientCommunication.prototype.onDisconnected = function() {
  throw "Disconnected";
};

ClientCommunication.prototype.dispatchMessage = function(msg) {
    this.dispatcher.dispatch(msg);
};

ClientCommunication.prototype.sendMessage = function(command, data){
  this.socket.send({
      command: command,
      data: data      
  });
};

ClientCommunication.prototype._start = function(data) {
 
};

ClientCommunication.prototype._addplayer = function(data) {
    var craft = this._hovercraftFactory.create(data.id);
    craft.setSync(data.sync);
    
    craft.emitter = new ParticleEmitter(data.id + 'trail', 1000, this.app,
    {
        maxsize: 100,
        maxlifetime: 0.2,
        rate: 50,
        scatter: vec3.create([1.0, 0.001, 1.0]),
        track: function(){
            this.position = vec3.create(craft.position);
        }
    });
    
    this.app.scene.addEntity(craft.emitter);    
    this.app.scene.addEntity(craft);
};

ClientCommunication.prototype._removeplayer = function(data) {
    var craft = this.app.scene.getEntity(data.id);
    this.app.scene.removeEntity(craft.emitter);
    this.app.scene.removeEntity(craft);
};

ClientCommunication.prototype._sync = function(data) {
    var entity = this.app.scene.getEntity(data.id);
    entity.setSync(data.sync);
};


exports.ClientCommunication = ClientCommunication;