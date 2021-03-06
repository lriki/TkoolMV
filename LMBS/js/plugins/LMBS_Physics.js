var $plugins =
[
  {"name":"LMBS_Physics","status":true,"description":"","parameters":{}}
];


//=============================================================================
/**
 *
 * @class LMBS_Body
 */
function LMBS_Body() { this.initialize.apply(this, arguments); }
LMBS_Body.prototype.constructor = LMBS_Body;

/**
*  constructor
*/
LMBS_Body.prototype.initialize = function() {
   LMBS_SceneGraph._physicsBodyList.push(this);
   this._shape = null;
   this._body = null;
   this._destroyed = false;
   this._tmpPos = new LMBS_Vector3();
}

/** */
LMBS_Body.prototype.destroy = function() {
    this._destroyed = true;
}

/** */
LMBS_Body.prototype.isDestroyed = function() {
    return this._destroyed;
}

/**
*
*/
LMBS_Body.prototype.setPosition = function(x, y) {
  this._body.SetPosition(new Box2D.Common.Math.b2Vec2(x, y));
}

/**
*   @return
*/
LMBS_Body.prototype.getPosition = function() {
    this._tmpPos.x = this._body.GetPosition().x;
    this._tmpPos.y = this._body.GetPosition().y;
    return this._tmpPos;
}

/**
*   @return {b2Vec2}
*/
LMBS_Body.prototype.getVelocity = function() {
   return this._body.GetLinearVelocity();
}

/**
 *
 */
LMBS_Body.prototype.applyForce = function(x, y) {
  this._body.ApplyForce(new Box2D.Common.Math.b2Vec2(x, y), this._body.GetWorldCenter());
}

/**
 *
 */
LMBS_Body.prototype.applyImpulse = function(x, y) {
    this._body.ApplyImpulse(new Box2D.Common.Math.b2Vec2(x, y), this._body.GetWorldCenter());
}

/**
 *
 */
LMBS_Body.prototype.applyMovement = function(x) {
    this._body.SetLinearVelocity(new Box2D.Common.Math.b2Vec2(x, this._body.GetLinearVelocity().y));
    if (this._body.IsAwake() == false) {
        this._body.SetAwake(true);
    }
}

/**
 *  callback(thisBody, otherBody)
 */
LMBS_Body.prototype.forEachContacts = function(callback) {
    for (var edge = this._body.GetContactList(); edge; edge = edge.m_next) // b2ContactEdge
    {
        var c = edge.contact;
        var b1 = c.GetFixtureA().GetBody();
        var b2 = c.GetFixtureB().GetBody();
        if (b1 == this._body) {
            callback(b1.GetUserData(), b2.GetUserData());
        }
        else {
            callback(b2.GetUserData(), b1.GetUserData());
        }
    }
}

/**
 *  @param  camera {LMBS_Camera}
 *  @param  g {PIXI.Graphics}
 */
LMBS_Body.prototype.debugDraw = function(camera, g) {
    var v = this._shape.GetVertices();
    var p = this._body.GetPosition();

    var t = new PIXI.Matrix();
    t.rotate(this._body.GetAngle());
    t.translate(p.x, p.y);
    //g.worldTransform(t);
    var inPt = new PIXI.Point(p.x, p.y);

    g.alpha = 0.5;

    if (this._body.GetType() == Box2D.Dynamics.b2Body.b2_dynamicBody) {
        g.beginFill(0x55FF55);  // 緑
    }
    else if (this._body.GetType() == Box2D.Dynamics.b2Body.b2_kinematicBody) {
        g.beginFill(0xFF5555);  // 赤
    }
    else if (this._body.GetType() == Box2D.Dynamics.b2Body.b2_staticBody) {
        g.beginFill(0x5555FF);  // 青
    }

    var w = 2;
    if (this._body.GetContactList() != null) {
        w = 4;  // 衝突しているなら太く
    }

    if (this._body.IsAwake()) {
        // アクティブなら枠線を赤
        g.lineStyle(w, 0xFF0000);
    }
    else {
        // Sleep 状態なら枠線を青
        g.lineStyle(w, 0x0000FF);
    }


    var ptList = new Array(5);
    for (var i = 0; i < 4; ++i) {
        inPt.x = v[i].x;
        inPt.y = v[i].y;
        ptList[i] = new PIXI.Point();
        t.apply(inPt, ptList[i]);
    }
    inPt.x = v[0].x;
    inPt.y = v[0].y;
    ptList[4] = new PIXI.Point();
    t.apply(inPt, ptList[4]);

    // さらにビュー・プロジェクション変換
    var tmpVec1 = new LMBS_Vector3();
    var tmpVec2 = new LMBS_Vector3();
    for (var i = 0; i < ptList.length; ++i) {
        tmpVec1.x = ptList[i].x;
        tmpVec1.y = ptList[i].y;
        camera.transformPosition(tmpVec1, tmpVec2);
        ptList[i].x = tmpVec2.x;
        ptList[i].y = tmpVec2.y;
    }

    //g.moveTo(v[0].x + p.x, v[0].y + p.y);
    //g.lineTo(v[1].x + p.x, v[1].y + p.y);
    //g.lineTo(v[2].x + p.x, v[2].y + p.y);
    //g.lineTo(v[3].x + p.x, v[3].y + p.y);
    //g.closePath();
    /*
    var pts = [
      v[0].x, v[0].y,
      v[1].x, v[1].y,
      v[2].x, v[2].y,
      v[3].x, v[3].y,
      v[0].x, v[0].y,];
      */
    g.drawPolygon(ptList);
    g.endFill();
}

//=============================================================================
/**
 *
 * @class LMBS_BoxBody
 * @constructor
 */
function LMBS_BoxBody() { this.initialize.apply(this, arguments); }
LMBS_BoxBody.prototype = Object.create(LMBS_Body.prototype);
LMBS_BoxBody.prototype.constructor = LMBS_BoxBody;

/**
 *  constructor
 */
 LMBS_BoxBody.prototype.initialize = function(width, height, density, categoryBits, maskBits) {
     LMBS_Body.prototype.initialize.call(this);

     this._shape = new Box2D.Collision.Shapes.b2PolygonShape;
     this._shape.SetAsBox(width / 2, height / 2);  // SetAsBox() は半分のサイズを期待している

              //console.log(categoryBits);
              //    console.log(maskBits);
              //var s = categoryBits.toString(16);
         //console.log(s);
         //var s = maskBits.toString(16);
             //console.log(s);

     var fixDef = new Box2D.Dynamics.b2FixtureDef;
     fixDef.filter.categoryBits = (categoryBits || 0x0001) & 0xFFFF;
     fixDef.filter.maskBits = (maskBits || 0xFFFF) & 0xFFFF;
     fixDef.density = density;  // 密度
     fixDef.friction = 0.5;   // 摩擦
     fixDef.restitution = 0.0;  // 跳ね返りはシステム的に全くなし
     fixDef.shape = this._shape;

    if (density < 0) {
        fixDef.isSensor = true;
    }

     var bodyDef = new Box2D.Dynamics.b2BodyDef;
     if (density <= 0) {
        bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
     }
     else {
        bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
     }
     //bodyDef.fixedRotation = true;  // 回転させない
     //bodyDef.position.x = 300;
     //bodyDef.position.y = 300;

     this._body = LMBS_SceneGraph.world.CreateBody(bodyDef);
     this._body.CreateFixture(fixDef);
     this._body.SetUserData(this);
 }

/**
 *  override
 */
//LMBS_BoxBody.prototype.debugDraw = function(camera, g) {
//}
