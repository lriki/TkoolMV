//=============================================================================
// RTK_Test.js
// The MIT License (MIT)
//=============================================================================

/*:
 * @plugindesc テスト用プラグイン
 * @author lriki
 *
 * @help このプラグインにはプラグインコマンドはありません。
 * テスト用に作成したものなので、実際に利用する場合には適当にリネームしてください
 */

(function(_global) {
    function splitExt(filename) {
        return filename.split(/\.(?=[^.]+$)/);
    }
    

    var _Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        _Game_Map_setup.apply(this, arguments);

        /*
        console.log(this.tileset());
        if (this.tileset()) {
            var tilesetNames = this.tileset().tilesetNames;
            for (var i = 0; i < tilesetNames.length; i++) {

                tokens = tilesetNames[i].split(/\.(?=[^.]+$)/);
                path = 'img/tilesets/' + tokens[0] + '.txt';

                StorageManager.load();

                console.log(path);
                //this._tilemap.bitmaps[i] = ImageManager.loadTileset(tilesetNames[i]);
            }
        }
        */
       // StorageManager.load();
    };

    // ちなみにこれ系の "round" は マップのループ対応のための繰り返し
    Game_Map.prototype.roundXWithDirectionLong = function(x, d, len) {
        var dx = this.roundXWithDirection(x, d);
        for (var i = 0; i < len - 1; i++) {
            dx = this.roundXWithDirection(dx, d);
        }
        return dx;
    };
    
    Game_Map.prototype.roundYWithDirectionLong = function(y, d, len) {
        var dy = this.roundYWithDirection(y, d);
        for (var i = 0; i < len - 1; i++) {
            dy = this.roundYWithDirection(dy, d);
        }
        return dy;
    };

    // 全方位進入禁止確認
    Game_Map.prototype.checkNotPassageAll = function(x, y) {
        var flags = this.tilesetFlags();
        var tiles = this.allTiles(x, y);
        var bits = 0;
        for (var i = 0; i < tiles.length; i++) {
            var flag = flags[tiles[i]];
            bits |= flag;
        }
        return (bits & 0x0f) == 0x0f;
    };


    // 溝チェック
    Game_Map.prototype.checkGroove = function(x, y) {
        var tiles = this.allTiles(x, y);
        for (var i = 0; i < tiles.length; i++) {
            if (Tilemap.isTileA1(tiles[i])) {
                return true;
            }
        }
        return false;
    }


    var _Game_CharacterBase_moveStraight = Game_CharacterBase.prototype.moveStraight;
    Game_CharacterBase.prototype.moveStraight = function(d) {
        _Game_CharacterBase_moveStraight.apply(this, arguments);
        if (!this.isMovementSucceeded()) {
            this.setMovementSuccess(
                this.canPassJumpGroundToGround(this._x, this._y, d) ||
                this.canPassJumpGroove(this._x, this._y, d));
            if (this.isMovementSucceeded()) {
                var x1 = Math.round(this._x);
                var y1 = Math.round(this._y);
                var x2 = Math.round($gameMap.roundXWithDirectionLong(this._x, d, 2));
                var y2 = Math.round($gameMap.roundYWithDirectionLong(this._y, d, 2));
                this.jump(x2 - x1, y2 - y1);
            }
        }
    };



    Game_CharacterBase.prototype.canPassJumpGroundToGround = function(x, y, d) {
        
        var x1 = Math.round(x);
        var y1 = Math.round(y);
        var x2 = Math.round($gameMap.roundXWithDirectionLong(x, d, 2));
        var y2 = Math.round($gameMap.roundYWithDirectionLong(y, d, 2));
        if (!$gameMap.isValid(x2, y2)) {
            // マップ外
            return false;
        }
        var d2 = this.reverseDir(d);
        if ($gameMap.isPassable(x1, y1, d) || $gameMap.isPassable(x2, y2, d2))
        {
            // 現在位置から移動できるなら崖ではない。
            // 移動先から手前に移動できるなら崖ではない。
            return false;
        } 
        if ($gameMap.checkNotPassageAll(x2, y2))
        {
            // 移動先が全方位進入禁止。壁とか。
            return false;
        }
        if (this.isCollidedWithCharacters(x2, y2)) {
            // 移動先にキャラクターがいる
            return false;
        }




        return true;
    }

    Game_CharacterBase.prototype.canPassJumpGroove = function(x, y, d) {
        var x1 = Math.round(x);
        var y1 = Math.round(y);
        var x2 = Math.round($gameMap.roundXWithDirectionLong(x, d, 2));
        var y2 = Math.round($gameMap.roundYWithDirectionLong(y, d, 2));
        var x3 = Math.round($gameMap.roundXWithDirectionLong(x, d, 1));
        var y3 = Math.round($gameMap.roundYWithDirectionLong(y, d, 1));
        if (!$gameMap.isValid(x2, y2)) {
            // マップ外
            return false;
        }
        if (!$gameMap.isPassable(x1, y1, d))
        {
            // 現在位置から移動できない
            return false;
        }
        var d2 = this.reverseDir(d);
        if (!$gameMap.isPassable(x2, y2, d2))
        {
            // 移動先から手前に移動できない
            return false;
        }
        if (this.isCollidedWithCharacters(x2, y2)) {
            // 移動先にキャラクターがいる
            return false;
        }
        if (!$gameMap.checkGroove(x3, y3)) {
            // 目の前のタイルが溝ではない
            return false;
        }
        return true;
    }

})(this);
