// Generated by RPG Maker.
// Do not edit this file directly.
var $plugins =
[
  {"name":"LMBS","status":true,"description":"","parameters":{}}
];


//LMBS_AnimationManager

Sprite_Battler.prototype.updatePosition = function() {
    this.x = this._battler.transform.tx;
    this.y = 100;
};



//=============================================================================
// LMBS_SceneGraph
//=============================================================================

function LMBS_SceneGraph() {
    throw new Error('This is a static class');
}

LMBS_SceneGraph.UNIT_PIXEL_SIZE = 64;

LMBS_SceneGraph._objectList   = [];
LMBS_SceneGraph._physicsBodyList   = [];
LMBS_SceneGraph._camera       = null;

LMBS_SceneGraph.initialize = function() {
    this.clear();
}

LMBS_SceneGraph.setup = function(viewportSprite) {
    this.clear();
    this.viewportSprite = viewportSprite;

    this._debugGraphics = new PIXI.Graphics();
    this.viewportSprite.addChild(this._debugGraphics);

    var gravityVertical = -9.8;
    var gravity = new Box2D.Common.Math.b2Vec2(0, gravityVertical);
    this.world = new Box2D.Dynamics.b2World(gravity, false);// trueだと止まったオブジェクトは計算対象からはずすので軽くなる

/*
    var debugDraw = new Box2D.Dynamics.b2DebugDraw();
		debugDraw.SetSprite(document.getElementById("canvas").getContext("2d"));
		debugDraw.SetDrawScale(30.0);
		debugDraw.SetFillAlpha(0.5);
		debugDraw.SetLineThickness(1.0);
		debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_jointBit);
		this.world.SetDebugDraw(debugDraw);
    */

    var b = new LMBS_BoxBody(1000, 10, 0);
    b.setPosition(30/2, -5);


    //this.test = new LMBS_BoxBody(100, 10, 1);
    //this.test2 = new LMBS_BoxBody(100, 10, 0);
    //this.test3 = new LMBS_BoxBody(100, 10, 1);
  //  this.test3.setPosition(350, 100);
}

LMBS_SceneGraph.clear = function() {
    this._objectList = [];
    this._physicsBodyList = [];
    this.camera = new LMBS_Camera();
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 10;
}

LMBS_SceneGraph.addObject = function(obj) {
    this._objectList.push(obj);
}

LMBS_SceneGraph.update = function() {

    if (Input.isPressed('pageup')) {
        this.camera.position.x += 0.25;
    }
    if (Input.isPressed('pagedown')) {
        this.camera.position.x -= 0.25;
    }
    if (Input.isPressed('control')) {
        this.camera.position.z -= 0.25;
    }
    if (Input.isPressed('shift')) {
        this.camera.position.z += 0.25;
    }



    this.camera.updateMatrix();

  //  var v = new THREE.Vector3(0, 0, 0);
    //var v2 = new THREE.Vector3(0, 0, 0);
    //this.camera.transformPosition(v, v2);
    //console.log(v2.x);


    this.world.Step(1 / 60, 10, 10);
    //this.world.DrawDebugData();
    this.world.ClearForces();
    this._objectList.forEach(function(obj){
        obj.onUpdate();
    });

    // 物理オブジェクトのデバッグ描画
    this._debugGraphics.clear();
    this._physicsBodyList.forEach(function(body){
        body.debugDraw(this.camera, this._debugGraphics);
    }, this);
}

//=============================================================================
/**
 *
 * @class LMBS_Camera
 * @constructor
 */
function LMBS_Camera() { this.initialize.apply(this, arguments); }
LMBS_Camera.prototype.constructor = LMBS_Camera;

/**
 * constructor
 */
LMBS_Camera.prototype.initialize = function() {
    this.position = new THREE.Vector3(0, 0, 1000);
    this.viewMatrix = new THREE.Matrix4();
    this.projMatrix = new THREE.Matrix4();
    this.viewProjMatrix = new THREE.Matrix4();

    this._lookAt = new THREE.Vector3();
    this._up = new THREE.Vector3(0, 1, 0);
    this._scalingWork1 = new THREE.Vector3(0, 1, 0);
    this._scalingWork2 = new THREE.Vector3(0, 1, 0);
}

/**
 */
LMBS_Camera.prototype.updateMatrix = function() {
    this._lookAt.x = this.position.x;
    this._lookAt.y = this.position.y;
    this._lookAt.z = 0;
    //this.viewMatrix.lookAt(this.position, this._lookAt, this._up);
    this.makeLookAtRH(this.position, this._lookAt, this._up, this.viewMatrix);
    this.projMatrix.makePerspective(75, Graphics.width / Graphics.height, 1, 10000);
    // 乗算の順序に注意
    this.viewProjMatrix.multiplyMatrices(this.projMatrix, this.viewMatrix);
}

/**
 *  @param  inPos {THREE.Vector3}
 *  @param  outPos {THREE.Vector3}
 */
LMBS_Camera.prototype.transformPosition = function(inPos, outPos) {
    outPos.copy(inPos);
    outPos.applyMatrix4(this.viewProjMatrix);

    // transformCoord
    var e = this.viewProjMatrix.elements;
    var w = 1.0 / ((((inPos.x * e[3]) + (inPos.y * e[7])) + (inPos.z * e[11])) + e[15]);
    outPos.x *= w;
    outPos.y *= w;
    outPos.z *= w;


    outPos.x = (outPos.x + 1) / 2 * Graphics.width;
    outPos.y = (outPos.y + 1) / 2 * Graphics.height;
    outPos.y *= -1;
    outPos.y += Graphics.height;
}

LMBS_Camera.prototype.makeLookAtRH = function(eye, target, up, outMatrix) {
    var x = new THREE.Vector3();
    var y = new THREE.Vector3();
    var z = new THREE.Vector3();

    var te = outMatrix.elements;

    z.subVectors( eye, target ).normalize();

    if ( z.lengthSq() === 0 ) {
    	z.z = 1;
    }

    x.crossVectors( up, z ).normalize();

    if ( x.lengthSq() === 0 ) {
    	z.x += 0.0001;
    	x.crossVectors( up, z ).normalize();
    }

    y.crossVectors( z, x );

    // オリジナルとは転置してある
    te[ 0 ] = x.x; te[ 1 ] = y.x; te[ 2 ] = z.x;
    te[ 4 ] = x.y; te[ 5 ] = y.y; te[ 6 ] = z.y;
    te[ 8 ] = x.z; te[ 9 ] = y.z; te[ 10 ] = z.z;

    te[ 12 ] = -(x.x * eye.x + x.y * eye.y + x.z * eye.z);
    te[ 13 ] = -(y.x * eye.x + y.y * eye.y + y.z * eye.z);
    te[ 14 ] = -(z.x * eye.x + z.y * eye.y + z.z * eye.z);
    te[ 15 ] = 1;
}


/**
 *  @param  inPos {THREE.Vector3}
 *  @param  outPos {THREE.Vector3}
 */
LMBS_Camera.prototype.calcScale = function(pos) {
    // TODO: ちょっとものぐさ。視線に対して垂直にずらしたベクトルを使うのがベスト。
    // このままだと真上を見たときに拡大率 0 になるかも。まぁそんな使い方まずしないと思うけど。
    this._scalingWork1.set(pos.x, pos.y, pos.z);
    this._scalingWork2.set(pos.x, pos.y + 1, pos.z);

    var v1 = new THREE.Vector3();
    var v2 = new THREE.Vector3();
    this.transformPosition(this._scalingWork1, v1);
    this.transformPosition(this._scalingWork2, v2);
  //  this._scalingWork1.applyMatrix4(this.viewProjMatrix);
    //this._scalingWork2.applyMatrix4(this.viewProjMatrix);
    //return this._scalingWork2.y - this._scalingWork1.y;
    return Math.abs(v2.y - v1.y);
}


//=============================================================================
// LMBS_Object
//=============================================================================

function LMBS_Object() {
    this.initialize.apply(this, arguments);
}

LMBS_Object.prototype.constructor = LMBS_Object;


LMBS_Object.prototype.initialize = function(actorId) {
    LMBS_SceneGraph.addObject(this);
}

LMBS_Object.prototype.onUpdate = function() {
}

//=============================================================================
// LMBS_Battler
//=============================================================================
function LMBS_Battler() {
    this.initialize.apply(this, arguments);
}
LMBS_Battler.prototype = Object.create(LMBS_Object.prototype);
LMBS_Battler.prototype.constructor = LMBS_Battler;

LMBS_Battler.DIRECTION = {
  LEFT      : 0,
  RIGHT     : 1,
};

/**
 *  override
 */
LMBS_Battler.prototype.initialize = function() {
    LMBS_Object.prototype.initialize.call(this);
    this.transform = new PIXI.Matrix();
    this.transform.ty = 300;
    this.direction = LMBS_Battler.DIRECTION.LEFT;
    this._motionFrameCount = 0;
    this._visual = null;
    this._currentMotion = null;
    this._currentAction = null;

/*
    var fixDef = new Box2D.Dynamics.b2FixtureDef;
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;
    fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(10);
    //bodyDef.fixedRotation

    var bodyDef = new Box2D.Dynamics.b2BodyDef;
    bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
    bodyDef.position.x = 300;
    bodyDef.position.y = 300;

    this.rigidBody = LMBS_SceneGraph.world.CreateBody(bodyDef);
    this.rigidBody.CreateFixture(fixDef);




            var container = new PIXI.DisplayObjectContainer();
    this.rigidBodyGraphics = new PIXI.Graphics();
    this.rigidBodyGraphics.lineStyle(2, 0xFF00FF);  //(thickness, color)
    this.rigidBodyGraphics.drawCircle(0, 0, 10);   //(x,y,radius)
    this.rigidBodyGraphics.endFill();
    SceneManager._scene.addChild(container);
    container.addChild(this.rigidBodyGraphics);
*/

    this.changeAction(new LMBS_IdleAction());
};

/**
 *  (座標とサイズはワールド空間ベース)
 */
LMBS_Battler.prototype.setupComponents = function(x, y, width, height) {
    this._objectSize = new LMBS_Vector2(width, height); // ワールド空間内でのサイズ
    // スプライト

    /*
    this.mainSprite = new Sprite();
    ・this.mainSprite.bitmap = ImageManager.loadSvActor("Actor1_1");
    ・・this.mainSprite.setFrame(0, 0, width, height);
    this.mainSprite.visible = true;
    this.mainSprite.anchor.x = 0.5;
    LMBS_SceneGraph.viewportSprite.addChild(this.mainSprite);
    */
    // 剛体
    this.mainBody = new LMBS_BoxBody(this._objectSize.x, this._objectSize.y, 1.0);
    this.mainBody.setPosition(x, y);
}

/**
 *  override
 */
LMBS_Battler.prototype.onUpdate = function() {
    LMBS_Object.prototype.onUpdate.call(this);
    /*
    if (Input.dir4 == 6) {
        this.transform.tx += 5;
        this.mainSprite.scale.x = -1;
        this.changeMotion("basic_move");
    }
    else if (Input.dir4 == 4) {
        this.transform.tx -= 5;
        this.mainSprite.scale.x = 1;
        this.changeMotion("basic_move");
    }
    else {
      this.changeMotion("basic_wait");
    }
    */

    this.transform.tx = this.mainBody.getPosition().x;
    this.transform.ty = this.mainBody.getPosition().y;



    var v = new THREE.Vector3(this.transform.tx, this.transform.ty, 0);
    var v2 = new THREE.Vector3();
    LMBS_SceneGraph.camera.transformPosition(v, v2);
    var scale = LMBS_SceneGraph.camera.calcScale(v);
    console.log(scale);
    this._visual.mainSprite.x = v2.x;//this.transform.tx;
    this._visual.mainSprite.y = v2.y;//this.transform.ty;


/*
    this.rigidBodyGraphics.clear();
    this.rigidBodyGraphics.lineStyle(2, 0xFF00FF);  //(thickness, color)
    this.rigidBodyGraphics.drawCircle(this.rigidBody.GetPosition().x, this.rigidBody.GetPosition().y, 10);   //(x,y,radius)
    this.rigidBodyGraphics.endFill();
*/


    // 向き
    var scaleX = 1;
    if (this.direction == LMBS_Battler.DIRECTION.LEFT) {
        scaleX = 1;
    }
    else {
        this._visual.mainSprite.scale.x = -1;
    }

    // 表示したいピクセルサイズで割ることで、ワールド座標系上のスケールを、ウィンドウ座標系上のスケールに変換する
    this._visual.mainSprite.scale.x = (scaleX * scale) / this._visual.mainSprite.width;
    this._visual.mainSprite.scale.y = scale / this._visual.mainSprite.height;

    // アクションの更新
    if (this._currentAction != null) {
        this._currentAction.onUpdate();
    }
    // モーションの更新
    if (this._currentMotion != null) {
        this._currentMotion.update(this, this._motionFrameCount);
    }
    this._motionFrameCount++;
}

/**
 *
 */
LMBS_Battler.prototype.changeMotion = function(name) {
    // 適用中モーションと同じものなら何もしない
    if (this._currentMotion != null && this._currentMotion.name == name) {
        return;
    }
    this._currentMotion = LMBS_MotionManager.getMotion(name);
    this._motionFrameCount = 0;
}

/**
 *
 */
LMBS_Battler.prototype.changeAction = function(action) {
    // 適用中モーションと同じものなら何もしない
    if (this._currentAction != null && this._currentAction.name == name) {
        return;
    }
    this._currentAction = action;
    if (this._currentAction) {
        this._currentAction.battler = this;
        this._currentAction.onAttached();
    }
}


//=============================================================================
/**
 *
 * @class LMBS_Actor
 * @constructor
 */
function LMBS_Actor() { this.initialize.apply(this, arguments); }
LMBS_Actor.prototype = Object.create(LMBS_Battler.prototype);
LMBS_Actor.prototype.constructor = LMBS_Actor;

/**
 * constructor
 */
LMBS_Actor.prototype.initialize = function(actor) {
    LMBS_Battler.prototype.initialize.call(this);
    this._actor = actor;
    this.setupComponents(10 - this._actor.index() * 2, 0, 1, 1);
    this._visual = new LMBS_AnimateSpliteVisual();
}

/**
 *  override
 */
LMBS_Actor.prototype.onUpdate = function() {
    LMBS_Battler.prototype.onUpdate.call(this);
    // ユーザー入力の更新
    if (this._currentAction != null &&
        $gameParty.members().indexOf(this._actor) == BattleManager.userOperationActorIndex) {
        this._currentAction.onUserInput();
    }
}

//=============================================================================
/**
 *
 * @class LMBS_Enemy
 * @constructor
 */
function LMBS_Enemy() { this.initialize.apply(this, arguments); }
LMBS_Enemy.prototype = Object.create(LMBS_Battler.prototype);
LMBS_Enemy.prototype.constructor = LMBS_Enemy;

/**
 * constructor
 *  @param  enemy {Game_Enemy}
 */
LMBS_Enemy.prototype.initialize = function(enemy) {
    LMBS_Battler.prototype.initialize.call(this);
    this._enemy = enemy;
    this.setupComponents(
      15 + this._enemy.screenX() * 15 / 816,
      15 - this._enemy.screenY() * 15 / 444,  // 反転。地面は0で、上がY+
      1, 1);
    this._visual = new LMBS_AnimateSpliteVisual();
    // (0, 16)～(816,444)
  //  console.log(15 + this._enemy.screenX() * 15 / 816);
  //  console.log(15 - this._enemy.screenY() * 15 / 444);
}

/**
 *  override
 */
LMBS_Enemy.prototype.onUpdate = function() {
    LMBS_Battler.prototype.onUpdate.call(this);
}

//=============================================================================
// Game_BattlerBase
//=============================================================================

// 継承
//Game_BattlerBase.prototype = Object.create(Game_LMBSObject.prototype);

//=============================================================================
// Game_Battler
//=============================================================================

//-----------------------------------------------------------------------------
// initMembers
//-----------------------------------------------------------------------------
var _Game_Battler_prototype_initMembers = Game_Battler.prototype.initMembers;
Game_Battler.prototype.initMembers = function() {
    _Game_Battler_prototype_initMembers.call(this);
    this.transform = new PIXI.Matrix();
    this.transform.tx = 200;
    //Game_LMBSObject.prototype.update.call(this);
}


//=============================================================================
// BattleManager
//=============================================================================

var _BattleManager_prototype_setup = BattleManager.setup;
BattleManager.setup = function(troopId, canEscape, canLose) {
    _BattleManager_prototype_setup.call(this, troopId, canEscape, canLose);
    this.userOperationActorIndex = 0; // ユーザー入力で操作するパーティ内のアクター番号
}

var _BattleManager_startBattle = BattleManager.startBattle;
BattleManager.startBattle = function() {
    _BattleManager_startBattle.call(this);

    $gameParty.members().forEach(function(actor) {
        var actorObj = new LMBS_Actor(actor);
    }, this);
    $gameTroop.members().forEach(function(enemy) {
        var enemyObj = new LMBS_Enemy(enemy);
    }, this);
}

BattleManager.update = function() {
    LMBS_SceneGraph.update();
}

//=============================================================================
// Scene_Boot
//=============================================================================
var _Scene_Boot_prototype_create = Scene_Boot.prototype.create;
Scene_Boot.prototype.create = function() {
    _Scene_Boot_prototype_create.call(this);
    LMBS_MotionManager.setup();
};

//=============================================================================
// Scene_Battle
//-----------------------------------------------------------------------------
//  SpriteSet は Scene クラスから SceneGraph へ送り込むのが自然だろう。
//=============================================================================

//-----------------------------------------------------------------------------
// create
//-----------------------------------------------------------------------------
var _Scene_Battle_prototype_create = Scene_Battle.prototype.create;
Scene_Battle.prototype.create = function() {
    _Scene_Battle_prototype_create.call(this);
    // SceneGraph のスプライトはどこへ addChild するか指定する
    LMBS_SceneGraph.setup(this._spriteset);
};
