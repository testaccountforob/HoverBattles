var HovercraftFactory = require('./shared/hovercraftfactory').HovercraftFactory;
var Scene = require('./shared/scene').Scene;
var ResourceManager = require('./shared/resources').ResourceManager;
var Controller = require('./shared/controller').Controller;
var Model = require('./shared/model').Model;
var Entity = require('./shared/entity').Entity;
var ServerModelLoader = require('./server/servermodelloader').ServerModelLoader;
var ServerLandChunkModelLoader = require('./server/serverlandchunkloader').ServerLandChunkModelLoader;
var LandscapeController = require('./shared/landscapecontroller').LandscapeController;
var ServerApp = require('./server/application').ServerApp;
var Bounding = require('./shared/bounding');
var mat4 = require('./shared/glmatrix').mat4;
var CollisionManager = require('./shared/collisionmanager').CollisionManager;
Frustum = require('./shared/frustum').Frustum;
var debug= require('./shared/debug');
var MessageDispatcher = require('./shared/messagedispatcher').MessageDispatcher;

exports["A Hovercraft can be boot-strapped with an application and all that jazz"] = function(test){
    
    var app = new ServerApp();
    var factory = new HovercraftFactory(app);
    
     var craft = factory.create('player');
     test.ok(craft != null, "Hovercraft was created");
     test.done();
};

exports["Scene can have entities added and requested from it"] = function(test){
    var app = new ServerApp();
    var factory = new HovercraftFactory(app);
    var craft = factory.create('player');
    
    app.scene.addEntity(craft);
    
    var player = app.scene.getEntity('player');
    
    test.ok(player === craft, "Craft was added to scene");
    test.done();
};

exports["Scene can have entities added and requested from it"] = function(test){
    var app = new ServerApp();
    var factory = new HovercraftFactory(app);
    var craft = factory.create('player');
    
    app.scene.addEntity(craft);
    
    var player = app.scene.getEntity('player');
    
    test.ok(player === craft, "Craft was requested from scene");
    test.done();
};


exports["Logic can be executed against enitities in the scene"] = function(test){
    var app = new ServerApp();
    var factory = new HovercraftFactory(app);
    var hovercraft = factory.create("player");
    var landscape = new LandscapeController(app);
    app.scene.addEntity(hovercraft);
    app.scene.doLogic();
            
    app.resources.onAllAssetsLoaded(function(){    
        var original = vec3.create(hovercraft.position);               
        
        hovercraft.impulseForward(0.1);
        hovercraft.impulseForward(-0.1);                
        hovercraft.impulseLeft(0.1);
        hovercraft.impulseRight(0.1);
        
        app.scene.doLogic();      
        
        test.notDeepEqual(original, hovercraft.position, "Hovercraft was moved with logic");
        test.done();
    }); 
};


exports["Two spheres that overlap test as overlapping"] = function(test) {
    
  var sphereOne = new Bounding.Sphere(5.0, [0,0,0]);
  var sphereTwo = new Bounding.Sphere(5.0, [2,0,0]);
  
  var result = sphereOne.intersectSphere(sphereTwo);
  
  test.ok(result.distance < 0.0, "They overlap");
  test.deepEqual([1,0,0], result.direction, "They overlap with a correct direction vector");
  test.done();
};

exports["Two spheres that don't overlap don't test as overlapping"] = function(test) {
    
  var sphereOne = new Bounding.Sphere(5.0, [0,0,0]);
  var sphereTwo = new Bounding.Sphere(5.0, [11,0,0]);
  
  var result = sphereOne.intersectSphere(sphereTwo);
  
  test.ok(result.distance > 0.0, "They don't overlap");
  test.deepEqual([1,0,0], result.direction, "They don't overlap with a correct direction vector");
  test.done();
};

exports["A transformed sphere doesn't overlap with its parent"] = function(test) {
    
  var sphereOne = new Bounding.Sphere(5.0, [0,0,0]);
  var sphereTwo = sphereOne.translate([11,0,0]);
  
  var result = sphereOne.intersectSphere(sphereTwo);
  
  test.ok(result.distance > 0.0, "They don't overlap");
  test.deepEqual([1,0,0], result.direction, "They don't overlap with a correct direction vector");
  test.done();
};

exports["A transformed sphere can overlap with its parent"] = function(test) {
    
  var sphereOne = new Bounding.Sphere(5.0, [0,0,0]);
  var sphereTwo = sphereOne.translate([2,0,0]);
  console.log(sphereTwo.centre)
    
  var result = sphereOne.intersectSphere(sphereTwo);
  
  test.ok(result.distance < 0.0, "They overlap");
  test.deepEqual([1,0,0], result.direction, "They overlap with a correct direction vector");
  test.done();
};

exports["Two colliding entities can be pulled apart by the collision manager"] = function(test){
  var entityOne = new Entity("one");
  var entityTwo = new Entity("two");
  var manager = new CollisionManager();
  
  entityOne.attach(
      {
        position: [0,0,0],
        _velocity: [0,0,0],
        getSphere: function(){
            return new Bounding.Sphere(5.0, [0,0,0]);   
        }
      });
  entityTwo.attach(
      {
        position: [5,0,0],
        _velocity: [0,0,0],
        getSphere: function(){
            return new Bounding.Sphere(5.0, [5,0,0]);   
        }
      });
      
      
  manager.processPair(entityOne, entityTwo);
  
  test.ok(entityOne.position[0] < -2.0 && entityOne.position[0] > -3.0 , "The first entity is moved by half the distance");
  test.ok(entityTwo.position[0] > 7.0 && entityTwo.position[0] < 8.0, "The second entity is moved by half the distance");
  
  test.done();
};

exports["Frustum can be tested against a sphere that intersects that frustum"] = function(test) {
    var projection = mat4.perspective(45, 4/3, 1, 1000.0);
    var frustum = new Frustum(projection);
    var transform = mat4.lookAt([5,0,0], [0,0,1000], [0,1,0]);
    frustum.setTransform(transform);
    var sphere = new Bounding.Sphere(10.0, [0, 0, 140]);
    
    var result = frustum.intersectSphere(sphere);
    
    for(i in debug){
     console.log('' + i + ': ' + debug[i]);   
    }
  
    test.ok(result === true);
    test.done();
};

exports["Frustum can be tested against a sphere that doesn't intersect that frustum"] = function(test) {
    var projection = mat4.perspective(45, 4/3, 1, 1000.0);
    var frustum = new Frustum(projection);
    var transform = mat4.lookAt([5,0,0], [0,0,1000], [0,1,0]);
    frustum.setTransform(transform);
    var sphere = new Bounding.Sphere(5.0, [0, 0, 1200]);
    
    var result = frustum.intersectSphere(sphere);
  
    test.ok(result === false);
    test.done();
};


exports["Message dispatcher can dispatch messages to the right receiver"] = function(test) {
  var dispatcher = new MessageDispatcher();
  var oneReceived = '';
  var twoReceived = '';
  
  var receiver1 = {
    _one: function(data) {
        oneReceived = data.message;
    }
  };
  var receiver2 = {
    _two: function(data) {
       twoReceived = data.message
    }
  };
  dispatcher.addReceiver(receiver1);
  dispatcher.addReceiver(receiver2);
  
  dispatcher.dispatch({
     command: 'one',
     data: {message: '1'}
  });
  
 dispatcher.dispatch({
     command: 'two',
     data: {message: '2'}
  });
  
  test.ok(oneReceived === '1');
  test.ok(twoReceived === '2');
  test.done();    
};
