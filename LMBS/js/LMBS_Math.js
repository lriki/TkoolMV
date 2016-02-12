
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
}

//=============================================================================
/**
 * 3Dベクトル
 * @class LMBS_Vector3
 */
function LMBS_Vector3() { this.initialize.apply(this, arguments); }
LMBS_Vector3.prototype.constructor = LMBS_Vector2;

/**
 * constructor
 */
LMBS_Vector3.prototype.initialize = function(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
}

/**
 * このベクトルに各要素を設定する。
 */
LMBS_Vector3.prototype.set = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

/**
 * 指定したベクトルからこのベクトルに各要素を設定する。
 */
LMBS_Vector3.prototype.copy = function(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
}

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
}
*/

/**
 * 2つのベクトルの差をこのベクトルに設定する。
 */
LMBS_Vector3.prototype.sub = function(a, b) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;
}

/**
 * このベクトルの長さの2乗を返す。
 */
LMBS_Vector3.prototype.lengthSq = function() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
}

/**
 * このベクトルを正規化する。
 */
LMBS_Vector3.prototype.normalize = function() {
    var t = 1.0 / Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    this.x = this.x * t;
    this.y = this.y * t;
    this.z = this.z * t;
}

/**
 * 2つのベクトルの外積をこのベクトルに設定する。
 */
LMBS_Vector3.prototype.cross = function(a, b) {
    var ax = a.x, ay = a.y, az = a.z;
    var bx = b.x, by = b.y, bz = b.z;
    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;
}

/**
 * 指定したベクトルを指定した行列で座標変換し、wで除算した結果を設定する。
 */
LMBS_Vector3.prototype.transformCoord = function(vec, mat) {
    var te = this.elements;
    var w = 1.0 / ((((vec.X * te[3]]) + (vec.Y * te[7]])) + (vec.Z * te[11])) + te[15]);
	this.x = ((vec.X * te[0]) + (vec.Y * te[4]) + (vec.Z * te[8]) + te[12]) * w,
	this.y = ((vec.X * te[1]) + (vec.Y * te[5]) + (vec.Z * te[9]) + te[13]) * w,
	this.z = ((vec.X * te[2]) + (vec.Y * te[6]) + (vec.Z * te[10]) + te[14]) * w);
}

//=============================================================================
/**
 * 4x4 行優先行列
 * @class LMBS_Matrix
 */
function LMBS_Matrix() { this.initialize.apply(this, arguments); }
LMBS_Matrix.prototype.constructor = LMBS_Vector2;

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
}

/**
 * 左手座標系のビュー行列を作成し、この行列に設定する。
 */
LMBS_Matrix.prototype.makeLookAtLH = function(eye, target, up) {
    var x, y, z;
    return function(v) {
        if (x === undefined) x = new LMBS_Vector3();
        if (y === undefined) y = new LMBS_Vector3();
        if (z === undefined) z = new LMBS_Vector3();
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
        te[ 0 ] = x.x; te[ 1 ] = y.x; te[ 2 ] = z.x;
        te[ 4 ] = x.y; te[ 5 ] = y.y; te[ 6 ] = z.y;
        te[ 8 ] = x.z; te[ 9 ] = y.z; te[ 10 ] = z.z;
        te[ 12 ] = -(x.x * eye.x + x.y * eye.y + x.z * eye.z);
        te[ 13 ] = -(y.x * eye.x + y.y * eye.y + y.z * eye.z);
        te[ 14 ] = -(z.x * eye.x + z.y * eye.y + z.z * eye.z);
        te[ 15 ] = 1;
    }
}

/**
 * 左手座標系のプロジェクション行列を作成し、この行列に設定する。
 */
LMBS_Matrix.prototype.makePerspectiveLH = function(fov, aspect, near, far) {
    var h = 1.0 / tan(fovY * 0.5);	// cot(fovY/2)
    var te = this.elements;
    te[ 0 ] = h / aspect; te[ 1 ] = 0;   te[ 2 ] = 0;                   te[ 3 ] = 0;
    te[ 4 ] = 0;          te[ 5 ] = h;   te[ 6 ] = 0;                   te[ 7 ] = 0;
    te[ 8 ] = 0;          te[ 9 ] = 0;   te[ 10] = far / (far - near);  te[ 11] = 1.0;
    te[ 12] = 0;          te[ 13] = 0;   te[ 14] = (-near * far) / (far - near); te[ 15] = 0;
}
