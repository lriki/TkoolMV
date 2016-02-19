
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
LMBS_Visual.prototype = Object.create(Sprite_Base.prototype);
LMBS_Visual.prototype.constructor = LMBS_Visual;

/**
 * constructor
 */
LMBS_Visual.prototype.initialize = function() {
    Sprite_Base.prototype.initialize.call(this);
    LMBS_SceneGraph.addVisual(this);
    LMBS_SceneGraph.viewportSprite.addChild(this);
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
    this.x = v2.x;//this.transform.tx;
    this.y = v2.y;//this.transform.ty;

    // 向き
    var scaleX = -this._direction;
    this.scale.x = scaleX;

    // 表示したいピクセルサイズで割ることで、ワールド座標系上のスケールを、ウィンドウ座標系上のスケールに変換する
    this.scale.x = (scaleX * scale) / this.mainSprite.width;
    this.scale.y = scale / this.mainSprite.height;
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

    this._weaponSprite = new LMBS_Sprite_Weapon();
    this.addChild(this._weaponSprite);

    this.mainSprite = new LMBS_Sprite_Battler();
    this.mainSprite.bitmap = ImageManager.loadSvActor(battlerName);
    this.mainSprite.setFrame(0, 0, 64, 64);
    this.mainSprite.visible = true;
    this.mainSprite.anchor.x = 0.5;
    this.addChild(this.mainSprite);
};

/**
 *
 */
LMBS_AnimateSpliteVisual.prototype.weaponSprite = function() {
    return this._weaponSprite;
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
    LMBS_Visual.prototype.initialize.call(this);

    this.mainSprite = new Sprite();
    this.mainSprite.bitmap = ImageManager.loadSvActor("Actor1_1");
    this.addChild(this.mainSprite);
};

//=============================================================================
/**
 *  武器 Sprite
 *  @class LMBS_Sprite_Weapon
 */
function LMBS_Sprite_Weapon() { this.initialize.apply(this, arguments); }
LMBS_Sprite_Weapon.prototype = Object.create(Sprite_Base.prototype);
LMBS_Sprite_Weapon.prototype.constructor = LMBS_Sprite_Weapon;

/**
 * constructor
 */
LMBS_Sprite_Weapon.prototype.initialize = function() {
    Sprite_Base.prototype.initialize.call(this);
    this._weaponImageId = -1;
    // 大体柄のあたりが原点になるくらいにする
    this.anchor.x = 0.5;
    this.anchor.y = 0.20;
};

/**
 *
 */
LMBS_Sprite_Weapon.prototype.changeWeaponImageId = function(weaponImageId) {
    this._weaponImageId = weaponImageId;
    this.loadBitmap();
    this.updateFrame();
};

/**
 *
 */
LMBS_Sprite_Weapon.prototype.weaponImageId = function() {
    return this._weaponImageId;
};

/**
 *
 */
LMBS_Sprite_Weapon.prototype.loadBitmap = function() {
    var pageId = Math.floor((this._weaponImageId - 1) / 12) + 1;
    if (pageId >= 1) {
        this.bitmap = ImageManager.loadSystem('Weapons' + pageId);
    } else {
        this.bitmap = ImageManager.loadSystem('');
    }
};

/**
 *
 */
LMBS_Sprite_Weapon.prototype.updateFrame = function() {
    if (this._weaponImageId > 0) {
        var index = (this._weaponImageId - 1) % 12;
        var w = 96;
        var h = 64;
        var sx = 2 * w;
        var sy = Math.floor(index % 6) * h;
        this.setFrame(sx, sy, w, h);
    } else {
        this.setFrame(0, 0, 0, 0);
    }
};
