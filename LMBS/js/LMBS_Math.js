
//=============================================================================
/**
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
