var $plugins =
[
  {"name":"LMBS_Math","status":true,"description":"","parameters":{}}
];

//=============================================================================
/**
 * 2Dベクトル
 * @class LMBS_Vector2
 */
function LMBS_Vector2() { this.initialize.apply(this, arguments); }
LMBS_Vector2.prototype.constructor = LMBS_Vector2;

/**
 * constructor
 */
LMBS_Vector2.prototype.initialize = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;
};

//=============================================================================
/**
 * 3Dベクトル
 * @class LMBS_Vector3
 */
function LMBS_Vector3() { this.initialize.apply(this, arguments); }
LMBS_Vector3.prototype.constructor = LMBS_Vector3;

/**
 * constructor
 */
LMBS_Vector3.prototype.initialize = function(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
};

/**
 * このベクトルに各要素を設定する。
 */
LMBS_Vector3.prototype.set = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
};

/**
 * 指定したベクトルからこのベクトルに各要素を設定する。
 */
LMBS_Vector3.prototype.copy = function(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
};

/**
 * このベクトルを正規化したベクトルを返す。
 */
/*
LMBS_Vector3.prototype.normalize = function () {
    var v1;
    return function(v) {
        if (v1 === undefined) v1 = new LMBS_Vector3();
        var t = 1.0 / Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        v1.x = this.x * t;
        v1.y = this.y * t;
        v1.z = this.z * t;
        return v1;
    }
};
*/

/**
 * 2つのベクトルの差をこのベクトルに設定する。
 */
LMBS_Vector3.prototype.sub = function(a, b) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;
};

/**
 * このベクトルの長さの2乗を返す。
 */
LMBS_Vector3.prototype.lengthSq = function() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
};

/**
 * このベクトルと指定したベクトルの距離の2乗を返す。
 */
LMBS_Vector3.prototype.distanceSq = function(v) {
    dx = this.x - v.x;
    dy = this.y - v.y;
    dz = this.z - v.z;
    return dx * dx + dy * dy + dz * dz;
};

/**
 * このベクトルを正規化する。
 */
LMBS_Vector3.prototype.normalize = function() {
    var t = 1.0 / Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    this.x = this.x * t;
    this.y = this.y * t;
    this.z = this.z * t;
};

/**
 * 2つのベクトルの外積をこのベクトルに設定する。
 */
LMBS_Vector3.prototype.cross = function(a, b) {
    var ax = a.x, ay = a.y, az = a.z;
    var bx = b.x, by = b.y, bz = b.z;
    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;
};

/**
 * 指定したベクトルを指定した行列で座標変換し、wで除算した結果を設定する。
 */
LMBS_Vector3.prototype.transformCoord = function(vec, mat) {
    var te = mat.elements;
    var w = 1.0 / ((((vec.x * te[3]) + (vec.y * te[7])) + (vec.z * te[11])) + te[15]);
  	this.x = ((vec.x * te[0]) + (vec.y * te[4]) + (vec.z * te[8]) + te[12]) * w,
  	this.y = ((vec.x * te[1]) + (vec.y * te[5]) + (vec.z * te[9]) + te[13]) * w,
  	this.z = ((vec.x * te[2]) + (vec.y * te[6]) + (vec.z * te[10]) + te[14]) * w;
};

//=============================================================================
/**
 * 4x4 行優先行列
 * @class LMBS_Matrix
 */
function LMBS_Matrix() { this.initialize.apply(this, arguments); }
LMBS_Matrix.prototype.constructor = LMBS_Matrix;

/**
 * constructor
 */
LMBS_Matrix.prototype.initialize = function() {
    this.elements = new Float32Array( [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	] );
};

/**
 * 左手座標系のビュー行列を作成し、この行列に設定する。
 */
LMBS_Matrix.prototype.makeLookAtLH = function(eye, target, up) {
    var x, y, z;
    //return function(eye, target, up) {
        //if (x === undefined) x = new LMBS_Vector3();
        //if (y === undefined) y = new LMBS_Vector3();
        //if (z === undefined) z = new LMBS_Vector3();
      x = new LMBS_Vector3();
      y = new LMBS_Vector3();
      z = new LMBS_Vector3();
        // 注視点からカメラ位置までのベクトルをZ軸とする
        z.sub(target, eye);
        z.normalize();
        // Z軸と上方向のベクトルの外積をとるとX軸が分かる
        x.cross(up, z);
        x.normalize();
        // 2つの軸がわかったので、その2つの外積は残りの軸(Y軸)になる
        y.cross( z, x );
        // 出力
        var te = this.elements;
        te[ 0 ] = x.x; te[ 1 ] = y.x; te[ 2 ] = z.x; te[ 3 ] = 0;
        te[ 4 ] = x.y; te[ 5 ] = y.y; te[ 6 ] = z.y; te[ 7 ] = 0;
        te[ 8 ] = x.z; te[ 9 ] = y.z; te[ 10 ] = z.z; te[ 11 ] = 0;
        te[ 12 ] = -(x.x * eye.x + x.y * eye.y + x.z * eye.z);
        te[ 13 ] = -(y.x * eye.x + y.y * eye.y + y.z * eye.z);
        te[ 14 ] = -(z.x * eye.x + z.y * eye.y + z.z * eye.z);
        te[ 15 ] = 1;
    //}
};

/**
 * 左手座標系のプロジェクション行列を作成し、この行列に設定する。
 */
LMBS_Matrix.prototype.makePerspectiveLH = function(fov, aspect, near, far) {
    var h = 1.0 / Math.tan(fov * 0.5);	// cot(fovY/2)
    var te = this.elements;
    te[ 0 ] = h / aspect; te[ 1 ] = 0;   te[ 2 ] = 0;                   te[ 3 ] = 0;
    te[ 4 ] = 0;          te[ 5 ] = h;   te[ 6 ] = 0;                   te[ 7 ] = 0;
    te[ 8 ] = 0;          te[ 9 ] = 0;   te[ 10] = far / (far - near);  te[ 11] = 1.0;
    te[ 12] = 0;          te[ 13] = 0;   te[ 14] = (-near * far) / (far - near); te[ 15] = 0;
};

/**
 * 指定した2つの行列を乗算し、この行列に設定する。
 */
LMBS_Matrix.prototype.multiply = function(a, b) {
    var ae = a.elements;
    var be = b.elements;
    var te = this.elements;

    var a11 = ae[ 0 ], a12 = ae[ 1 ], a13 = ae[ 2 ], a14 = ae[ 3 ];
    var a21 = ae[ 4 ], a22 = ae[ 5 ], a23 = ae[ 6 ], a24 = ae[ 7 ];
    var a31 = ae[ 8 ], a32 = ae[ 9 ], a33 = ae[ 10 ], a34 = ae[ 11 ];
    var a41 = ae[ 12 ], a42 = ae[ 13 ], a43 = ae[ 14 ], a44 = ae[ 15 ];

    var b11 = be[ 0 ], b12 = be[ 1 ], b13 = be[ 2 ], b14 = be[ 3 ];
    var b21 = be[ 4 ], b22 = be[ 5 ], b23 = be[ 6 ], b24 = be[ 7 ];
    var b31 = be[ 8 ], b32 = be[ 9 ], b33 = be[ 10 ], b34 = be[ 11 ];
    var b41 = be[ 12 ], b42 = be[ 13 ], b43 = be[ 14 ], b44 = be[ 15 ];

    te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    te[ 1 ] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    te[ 2 ] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    te[ 3 ] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

    te[ 4 ] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    te[ 5 ] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    te[ 6 ] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    te[ 7 ] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

    te[ 8 ] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    te[ 9 ] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    te[ 10 ] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    te[ 11 ] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

    te[ 12 ] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    te[ 13 ] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    te[ 14 ] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    te[ 15 ] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
};

//=============================================================================
/**
 * イージング関数
 * Easing Function 早見表 > http://easings.net/ja
 * 各関数の引数は、t:現在時間(0.0～d) b:開始値 c:値の変化量 (目標値-開始値) d:変化にかける時間
 * @class LMBS_Easing
 */
 function LMBS_Easing() {
     throw new Error('This is a static class');
 }

LMBS_Easing.linearTween = function (t, b, c, d) {
	return c*t/d + b;
};

LMBS_Easing.easeInQuad = function (t, b, c, d) {
	t /= d;
	return c*t*t + b;
};

LMBS_Easing.easeOutQuad = function (t, b, c, d) {
	t /= d;
	return -c * t*(t-2) + b;
};

LMBS_Easing.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

LMBS_Easing.easeInCubic = function (t, b, c, d) {
	t /= d;
	return c*t*t*t + b;
};

LMBS_Easing.easeOutCubic = function (t, b, c, d) {
	t /= d;
	t--;
	return c*(t*t*t + 1) + b;
};

LMBS_Easing.easeInOutCubic = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t + b;
	t -= 2;
	return c/2*(t*t*t + 2) + b;
};

LMBS_Easing.easeInQuart = function (t, b, c, d) {
	t /= d;
	return c*t*t*t*t + b;
};

LMBS_Easing.easeOutQuart = function (t, b, c, d) {
	t /= d;
	t--;
	return -c * (t*t*t*t - 1) + b;
};

LMBS_Easing.easeInOutQuart = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t*t + b;
	t -= 2;
	return -c/2 * (t*t*t*t - 2) + b;
};

LMBS_Easing.easeInQuint = function (t, b, c, d) {
	t /= d;
	return c*t*t*t*t*t + b;
};

LMBS_Easing.easeOutQuint = function (t, b, c, d) {
	t /= d;
	t--;
	return c*(t*t*t*t*t + 1) + b;
};

LMBS_Easing.easeInOutQuint = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t*t*t + b;
	t -= 2;
	return c/2*(t*t*t*t*t + 2) + b;
};

LMBS_Easing.easeInSine = function (t, b, c, d) {
	return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
};

LMBS_Easing.easeOutSine = function (t, b, c, d) {
	return c * Math.sin(t/d * (Math.PI/2)) + b;
};

LMBS_Easing.easeInOutSine = function (t, b, c, d) {
	return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
};

LMBS_Easing.easeInExpo = function (t, b, c, d) {
	return c * Math.pow( 2, 10 * (t/d - 1) ) + b;
};

LMBS_Easing.easeOutExpo = function (t, b, c, d) {
	return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
};

LMBS_Easing.easeInOutExpo = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2 * Math.pow( 2, 10 * (t - 1) ) + b;
	t--;
	return c/2 * ( -Math.pow( 2, -10 * t) + 2 ) + b;
};

LMBS_Easing.easeInCirc = function (t, b, c, d) {
	t /= d;
	return -c * (Math.sqrt(1 - t*t) - 1) + b;
};

LMBS_Easing.easeOutCirc = function (t, b, c, d) {
	t /= d;
	t--;
	return c * Math.sqrt(1 - t*t) + b;
};

LMBS_Easing.easeInOutCirc = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
	t -= 2;
	return c/2 * (Math.sqrt(1 - t*t) + 1) + b;
};

//=============================================================================
/**
 *  イージングによりシンプルに遷移する値のクラスです。
 *  @class LMBS_EasingValue
 */
function LMBS_EasingValue() { this.initialize.apply(this, arguments); }
LMBS_EasingValue.prototype.constructor = LMBS_EasingValue;

/**
 * constructor
 */
LMBS_EasingValue.prototype.initialize = function(value, easingFunc) {
    this._startValue = value || 0;
    this._targetValue = value || 0;
    this._value = value || 0;
  	this._currentTime = 0;
  	this._totalTime = 0;
    this._easing = easingFunc || LMBS_Easing.linearTween;
};

/**
 * イージング関数を設定
 */
LMBS_EasingValue.prototype.setEasingFunction = function(easingFunc) {
    this._easing = easingFunc;
};

/**
 * 値を設定する
 */
LMBS_EasingValue.prototype.setValue = function(value) {
    this._startValue = value;
  	this._targetValue = value;
    this._value = value;
  	this._totalTime = 0;
  	this._currentTime = 0;
};

/**
 * 値の遷移を開始します。
 */
LMBS_EasingValue.prototype.start = function(startValue, targetValue, time) {
    this._startValue = startValue;
  	this._targetValue = targetValue;
  	this._totalTime = time;
  	this._currentTime = 0.0;
  	this.setTime(this._currentTime);
};

/**
 * 値の遷移を開始します。開始として現在の値を使用します。
 */
LMBS_EasingValue.prototype.startAt = function(targetValue, time) {
  this._startValue = this._value;
	this._targetValue = targetValue;
	this._totalTime = time;
	this._currentTime = 0.0;
	this.setTime(this._currentTime);
};

/**
 * 経過時間を設定します。
 */
LMBS_EasingValue.prototype.setTime = function(time) {
	this._currentTime = time;
	this._updateValue();
};

/**
 * 指定した値だけ時間を進めます。
 */
LMBS_EasingValue.prototype.advanceTime = function(deltaTime) {
	this._currentTime += deltaTime;
	this._updateValue();
};

/**
 * 現在の値を取得します。
 * 経過時間が 0 以前の場合は 開始時の値を、経過時間が 変更にかける時間以上 の場合は 終了時の値 を返します。
 */
LMBS_EasingValue.prototype.getValue = function() {
	return this._value;
};

/**
 * 現在の値を取得します。
 * 経過時間が 0 以前の場合は 開始時の値を、経過時間が 変更にかける時間以上 の場合は 終了時の値 を返します。
 */
LMBS_EasingValue.prototype.isFinished = function() {
	return (this._currentTime >= this._totalTime);
};

LMBS_EasingValue.prototype._updateValue = function() {
  if (this._currentTime >= this._totalTime)
	{
		this._value = m_targetValue;
	}
	else if (this._currentTime <= 0 || this._totalTime <= 0)
	{
		this._value = this._startValue;
	}
	else
	{
		this._value = this._easing(this._currentTime, this._startValue, this._targetValue - this._startValue, this._totalTime);
	}
};
