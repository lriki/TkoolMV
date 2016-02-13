
//=============================================================================
/**
 *  LMBS_Battler にアタッチされる、モーションの適用先となる描画要素のベースクラス。
 *  @class LMBS_Visual
 */
function LMBS_Visual() { this.initialize.apply(this, arguments); }
LMBS_Visual.prototype.constructor = LMBS_Visual;

/**
 * constructor
 */
LMBS_Visual.prototype.initialize = function() {
}

//=============================================================================
/**
 *  ツクールMV標準のコマ割りアニメーションで表現される Visual。
 *  アクターのデフォルトはこれが使用される。
 *  @class LMBS_AnimateSpliteVisual
 */
function LMBS_AnimateSpliteVisual() { this.initialize.apply(this, arguments); }
LMBS_AnimateSpliteVisual.prototype = Object.create(LMBS_Visual.prototype);
LMBS_AnimateSpliteVisual.prototype.constructor = LMBS_AnimateSpliteVisual;

/**
 * constructor
 */
LMBS_AnimateSpliteVisual.prototype.initialize = function() {
    LMBS_Visual.prototype.initialize.call(this, name);

    this.mainSprite = new Sprite_Base();
    this.mainSprite.bitmap = ImageManager.loadSvActor("Actor1_1");
    this.mainSprite.setFrame(0, 0, 64, 64);
    this.mainSprite.visible = true;
    this.mainSprite.anchor.x = 0.5;
    LMBS_SceneGraph.viewportSprite.addChild(this.mainSprite);
}

//=============================================================================
/**
 *  アニメーションを伴わない、1枚絵で表現される Visual。
 *  エネミーのデフォルトはこれが使用される。
 *  @class LMBS_PictureSpliteVisual
 */
function LMBS_PictureSpliteVisual() { this.initialize.apply(this, arguments); }
LMBS_PictureSpliteVisual.prototype = Object.create(LMBS_Visual.prototype);
LMBS_PictureSpliteVisual.prototype.constructor = LMBS_PictureSpliteVisual;

/**
 * constructor
 */
LMBS_PictureSpliteVisual.prototype.initialize = function() {
    LMBS_Visual.prototype.initialize.call(this, name);

    this.mainSprite = new Sprite();
    this.mainSprite.bitmap = ImageManager.loadSvActor("Actor1_1");
    LMBS_SceneGraph.viewportSprite.addChild(this.mainSprite);
}
