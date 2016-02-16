// Generated by RPG Maker.
// Do not edit this file directly.
var $plugins =
[
  {"name":"LMBS＿Motion","status":true,"description":"","parameters":{}}
];



LMBS_SupportVisualType = {
    SvSprite      : 'SvSprite',
    Picture       : 'Picture',
    SpriteStudio  : 'SpriteStudio',  // TODO
};

//=============================================================================
// LMBS_MotionManager
//=============================================================================
function LMBS_MotionManager() {
    throw new Error('This is a static class');
}

LMBS_MotionManager._motions   = {};

/**
 */
LMBS_MotionManager.setup = function() {
    this.registerMotion(new LMBS_Motion_Idle_SvSprite("basic_wait"));
    this.registerMotion(new LMBS_Motion_WalkFront_SvSprite("basic_move"));
}

/**
 * @param name {String}
 * @param motion {LMBS_Motion}
 */
LMBS_MotionManager.registerMotion = function(motion) {
    this._motions[motion.name] = motion;
}

/**
 * @param name {String}
 */
LMBS_MotionManager.getMotion = function(name) {
    return this._motions[name];
}


//=============================================================================
// LMBS_Motion
//-----------------------------------------------------------------------------
// Battler のモーション1つ分とエフェクト。
//=============================================================================
function LMBS_Motion() { this.initialize.apply(this, arguments); }
LMBS_Motion.prototype.constructor = LMBS_Motion;
LMBS_Motion.prototype.initialize = function(name) {
    this.name = name;
}

/**
 * このモーションがサポートする適用先のビットフラグ。サブクラスでオーバーライドする。
 */
LMBS_Motion.prototype.getSupportVisualType = function() {
    return 0;
};

/**
 * @param battler     : LMBS_Battler
 * @param frameCount
 */
LMBS_Motion.prototype.update = function(battler, frameCount) {

}

//=============================================================================
// LMBS_ScriptMotion
//-----------------------------------------------------------------------------
// Javascript で定義
//=============================================================================
function LMBS_ScriptMotion() { this.initialize.apply(this, arguments); }
LMBS_ScriptMotion.prototype = Object.create(LMBS_Motion.prototype);
LMBS_ScriptMotion.prototype.constructor = LMBS_ScriptMotion;
LMBS_ScriptMotion.prototype.initialize = function(name) {
    LMBS_Motion.prototype.initialize.call(this, name);
}

//LMBS_ScriptMotion.update = function() {
//}

//=============================================================================
// LMBS_Motion_Idle_SvSprite
//-----------------------------------------------------------------------------
//
//=============================================================================
function LMBS_Motion_Idle_SvSprite() { this.initialize.apply(this, arguments); }
LMBS_Motion_Idle_SvSprite.prototype = Object.create(LMBS_Motion.prototype);
LMBS_Motion_Idle_SvSprite.prototype.constructor = LMBS_Motion_Idle_SvSprite;
LMBS_Motion_Idle_SvSprite.prototype.initialize = function(name) {
    LMBS_Motion.prototype.initialize.call(this, name);
}

/** override */
LMBS_Motion_Idle_SvSprite.prototype.getSupportVisualType = function() {
    return LMBS_SupportVisualType.SvSprite;
};

/** override */
LMBS_Motion_Idle_SvSprite.prototype.update = function(battler, frameCount) {
    var pattern = Math.floor(frameCount / 20) % 3;
    battler._visual.mainSprite.setFrame(pattern * 64, 0, 64, 64);
}

//=============================================================================
// LMBS_Motion_WalkFront_SvSprite
//-----------------------------------------------------------------------------
//
//=============================================================================
function LMBS_Motion_WalkFront_SvSprite() { this.initialize.apply(this, arguments); }
LMBS_Motion_WalkFront_SvSprite.prototype = Object.create(LMBS_Motion.prototype);
LMBS_Motion_WalkFront_SvSprite.prototype.constructor = LMBS_Motion_WalkFront_SvSprite;
LMBS_Motion_WalkFront_SvSprite.prototype.initialize = function(name) {
    LMBS_Motion.prototype.initialize.call(this, name);
}

/** override */
LMBS_Motion_WalkFront_SvSprite.prototype.getSupportVisualType = function() {
    return LMBS_SupportVisualFlags.SvSprite;
};

/** override */
LMBS_Motion_WalkFront_SvSprite.prototype.update = function(battler, frameCount) {
    //var pattern = Math.floor(frameCount / 20) % 3;
    //battler.mainSprite.setFrame(pattern * 64, 0, 64, 64);
  //  console.log(pattern * 64);
    var pattern = Math.floor(frameCount / 10) % 2;
    if (pattern == 0) {
        battler._visual.mainSprite.setFrame(0, 64, 64, 64);
    }
    else if (pattern == 1) {
        battler._visual.mainSprite.setFrame(192, 0, 64, 64);
    }
}
