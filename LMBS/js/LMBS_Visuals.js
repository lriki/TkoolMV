
//=============================================================================
/**
 *  3D 空間上に表示するための Sprite_Animation
 *  @class LMBS_Sprite_Animation
 */
function LMBS_Sprite_Animation() { this.initialize.apply(this, arguments); }
LMBS_Sprite_Animation.prototype = Object.create(Sprite_Animation.prototype);
LMBS_Sprite_Animation.prototype.constructor = LMBS_Sprite_Animation;

/**
 * constructor
 */
LMBS_Sprite_Animation.prototype.initialize = function() {
    Sprite_Animation.prototype.initialize.call(this);
};

/**
 * override
 */
LMBS_Sprite_Animation.prototype.updatePosition = function() {
    if (this._animation.position === 3) {
        this.x = this.parent.width / 2;
        this.y = this.parent.height / 2;
    } else {
        /*
        var parent = this._target.parent;
        var grandparent = parent ? parent.parent : null;
        this.x = this._target.x;
        this.y = this._target.y;
        if (this.parent === grandparent) {
            this.x += parent.x;
            this.y += parent.y;
        }
        if (this._animation.position === 0) {
            this.y -= this._target.height;
        } else if (this._animation.position === 1) {
            this.y -= this._target.height / 2;
        }
        */
    }
};

//=============================================================================
/**
 *  3D 空間に配置するための Sprite
 *  @class LMBS_Sprite_Battler
 */
function LMBS_Sprite_Battler() { this.initialize.apply(this, arguments); }
LMBS_Sprite_Battler.prototype = Object.create(Sprite_Base.prototype);
LMBS_Sprite_Battler.prototype.constructor = LMBS_Sprite_Battler;

/**
 * constructor
 */
LMBS_Sprite_Battler.prototype.initialize = function() {
    Sprite_Base.prototype.initialize.call(this);
};

/**
 * override
 */
LMBS_Sprite_Battler.prototype.startAnimation = function(animation, mirror, delay) {
    var sprite = new LMBS_Sprite_Animation(); // LMBS_Sprite_Animation を作るようにする
    sprite.setup(this._effectTarget, animation, mirror, delay);
    this.addChild(sprite);
    this._animationSprites.push(sprite);
};

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
    LMBS_SceneGraph.addVisual(this);
    this._position = new LMBS_Vector3();
    this._direction = 1;
};

/**
 *  ワールド空間上の座標を設定する。
 *  @param pos {LMBS_Vector3}
 */
LMBS_Visual.prototype.setPosition = function(pos) {
    this._position.copy(pos);
};

/**
 *  ワールド空間上の向きを設定する
 */
LMBS_Visual.prototype.setDirection = function(direction) {
    this._direction = direction;
};

/**
 *  座標の更新。カメラ位置を考慮し、スプライトの姿勢を決定する。
 *  ここではアニメーションは遷移させない。
 */
LMBS_Visual.prototype.updateCoordinate = function() {
    var v2 = new LMBS_Vector3();
    LMBS_SceneGraph.camera.transformPosition(this._position, v2);
    var scale = LMBS_SceneGraph.camera.calcScale(this._position);
    this.mainSprite.x = v2.x;//this.transform.tx;
    this.mainSprite.y = v2.y;//this.transform.ty;

    // 向き
    var scaleX = -this._direction;
    this.mainSprite.scale.x = scaleX;

    // 表示したいピクセルサイズで割ることで、ワールド座標系上のスケールを、ウィンドウ座標系上のスケールに変換する
    this.mainSprite.scale.x = (scaleX * scale) / this.mainSprite.width;
    this.mainSprite.scale.y = scale / this.mainSprite.height;
};

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
LMBS_AnimateSpliteVisual.prototype.initialize = function(battlerName) {
    LMBS_Visual.prototype.initialize.call(this);

    this.mainSprite = new LMBS_Sprite_Battler();
    this.mainSprite.bitmap = ImageManager.loadSvActor(battlerName);
    this.mainSprite.setFrame(0, 0, 64, 64);
    this.mainSprite.visible = true;
    this.mainSprite.anchor.x = 0.5;
    LMBS_SceneGraph.viewportSprite.addChild(this.mainSprite);
};

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
    LMBS_Visual.prototype.initialize.call(this);

    this.mainSprite = new Sprite();
    this.mainSprite.bitmap = ImageManager.loadSvActor("Actor1_1");
    LMBS_SceneGraph.viewportSprite.addChild(this.mainSprite);
};
