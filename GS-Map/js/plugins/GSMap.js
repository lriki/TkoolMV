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
    
    //-----------------------------------------------------------------------------
    // Game_Map
    // 　
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

    //-----------------------------------------------------------------------------
    // Game_CharacterBase
    // 　

    var _Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
    Game_CharacterBase.prototype.initMembers = function() {
        _Game_CharacterBase_initMembers.apply(this, arguments);
        this._ridingCharacterId = -1;
        this._ridderCharacterId = -1;
    }

    var _Game_CharacterBase_screenZ = Game_CharacterBase.prototype.screenZ;
    Game_CharacterBase.prototype.screenZ = function() {
        var base = _Game_CharacterBase_screenZ.apply(this, arguments);
        return base + (this.riddingObject() != null ? 5 : 0);
    };

    var _Game_CharacterBase_moveStraight = Game_CharacterBase.prototype.moveStraight;
    Game_CharacterBase.prototype.moveStraight = function(d) {
        if (this.ridding()) {
            // 何かのオブジェクトに乗っている。
            // オリジナルの処理を含め、元の移動処理は行わない。

            if (this.checkJumpObjectToGround(this._x, this._y, d)) {
                this.setMovementSuccess(true);
                this.getOffFromObject();
                this.jumpToDir(d, 2);
            }
            
            this.setDirection(d);
        }
        else {
            _Game_CharacterBase_moveStraight.apply(this, arguments);
            if (!this.isMovementSucceeded()) {
                this.setMovementSuccess(
                    this.canPassJumpGroundToGround(this._x, this._y, d) ||
                    this.canPassJumpGroove(this._x, this._y, d));
    
    
                if (this.isMovementSucceeded()) {
                    this.jumpToDir(d, 2);
                }
                else {
                    this.tryJumpGroundToObject(d);
                }
            }
        }
    };
    
    Game_CharacterBase.prototype.tryJumpGroundToObject = function(d) {
        var obj = this.checkJumpGroundToObject(this._x, this._y, d);
        this.setMovementSuccess(obj != null);
        if (this.isMovementSucceeded()) {
            // 乗る
            this.rideToObject(obj);
            this.jumpToDir(d, 2);
        }
    };

    // 方向と距離を指定してジャンプ開始
    Game_CharacterBase.prototype.jumpToDir = function(d, len) {
        // x1, y1 は小数点以下を調整しない。ジャンプ後に 0.5 オフセット無くなるようにしたい
        var x1 = this._x;
        var y1 = this._y;
        var x2 = Math.round($gameMap.roundXWithDirectionLong(this._x, d, len));
        var y2 = Math.round($gameMap.roundYWithDirectionLong(this._y, d, len));
        this.jump(x2 - x1, y2 - y1);
    }

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

    // GS オブジェクトとしての高さ。
    // 高さを持たないのは -1。（GSObject ではない）
    Game_CharacterBase.prototype.objectHeight = function() {
        return -1;
    };

    Game_CharacterBase.prototype.canRide = function() {
        return this.objectHeight() >= 0;
    };

    Game_CharacterBase.prototype.ridding = function() {
        return this._ridingCharacterId >= 0;
    };

    // 0:プレイヤー, 1~:イベント
    Game_CharacterBase.prototype.gsObjectId = function() {
        return -1;
    };

    // この人が乗っているオブジェクト
    Game_CharacterBase.prototype.riddingObject = function() {
        if (this._ridingCharacterId < 0) {
            return null;
        }
        else if (this._ridingCharacterId == 0) {
            return $gamePlayer;
        }
        else {
            return $gameMap.event(this._ridingCharacterId);
        }
    };

    // このオブジェクトに乗っている人
    Game_CharacterBase.prototype.rider = function() {
        if (this._ridderCharacterId < 0) {
            return null;
        }
        else if (this._ridderCharacterId == 0) {
            return $gamePlayer;
        }
        else {
            return $gameMap.event(this._ridderCharacterId);
        }
        return null;
    };
    

    
    Game_CharacterBase.prototype.checkJumpGroundToObject = function(x, y, d) {
        var x1 = Math.round(x);
        var y1 = Math.round(y);
        // ジャンプ先座標を求める
        var new_x = Math.round($gameMap.roundXWithDirectionLong(x, d, 2));
        var new_y = Math.round($gameMap.roundYWithDirectionLong(y, d, 2));
        
        if ($gameMap.isPassable(x1, y1, d)) {
            // 現在位置から移動できるなら崖ではない
            return null;
        }

        // 乗れそうなオブジェクトを探す
        var events = $gameMap.events();
        var obj = null;
        for(var i = 0; i < events.length; i++) {
            if(events[i].checkPassRide(new_x, new_y)) {
                obj = events[i];
                break;
            };
        };
        if (obj) {
            return obj;
        }

        return null;
    }
    
    Game_CharacterBase.prototype.checkJumpObjectToGround = function(x, y, d) {
        // ジャンプ先座標を求める
        var new_x = Math.round($gameMap.roundXWithDirectionLong(x, d, 2));
        var new_y = Math.round($gameMap.roundYWithDirectionLong(y, d, 2));
        var d2 = this.reverseDir(d);
        if ($gameMap.isPassable(new_x, new_y, d2)) {
            // 移動先から手前に移動できるなら崖ではない
            return false;
        }
        if (this.isCollidedWithCharacters(new_x, new_y)) {
            // 移動先にキャラクターがいる
            return false;
        }
        return true;
    }

    // グローバル座標 x, yから見た時、この obj の上に乗れるか
    Game_CharacterBase.prototype.checkPassRide = function(x, y) {
        if (this.canRide() && !this.rider()) {
            var px = Math.round(this._x);
            var py = Math.round(this._y) - this.objectHeight();
            if (x == px && y == py) {
                return true;
            }
        }
        return false;
    };

    
    Game_CharacterBase.prototype.rideToObject = function(riddenObject) {
        this._ridingCharacterId = riddenObject.gsObjectId();
        riddenObject._ridderCharacterId = this.gsObjectId();
    };
    
    Game_CharacterBase.prototype.getOffFromObject = function() {
        var obj = this.riddingObject();
        if (obj != null) {
            obj._ridderCharacterId = -1;
        }
        this._ridingCharacterId = -1;
    }
    
    
    var _Game_CharacterBase_updateMove = Game_CharacterBase.prototype.updateMove;
    Game_CharacterBase.prototype.updateMove = function() {
        //var oldm = this.isMoving();
        _Game_CharacterBase_updateMove.apply(this, arguments);
        //if (!this.isMoving() && oldm != this.isMoving())
        //{
        //    console.log("stop");
       // }
    };

    
    //-----------------------------------------------------------------------------
    // Game_Player
    // 　

    Game_Player.prototype.gsObjectId = function() {
        return 0;
    };
    
    //-----------------------------------------------------------------------------
    // Game_Event
    // 　
    
    var _Game_Event_initialize = Game_Event.prototype.initialize;
    Game_Event.prototype.initialize = function(mapId, eventId) {
        _Game_Event_initialize.apply(this, arguments);

        this._gsObjectHeight = -1;
        this.parseNoteForGSObj(this.event().note);
    };

    Game_Event.prototype.gsObjectId = function() {
        return this.eventId();
    };

    Game_Event.prototype.objectHeight = function() {
        return this._gsObjectHeight;
    };

    Game_Event.prototype.parseNoteForGSObj = function(note) {
        var index = note.indexOf("@GSObj");
        if (index >= 0)
        {
            var block = note.substring(index + 6);
            block = block.substring(
                block.indexOf("{") + 1,
                block.indexOf("}"));

            var nvps = block.split(",");
            for (var i = 0; i < nvps.length; i++) {
                var tokens = block.split(":");
                switch (tokens[0])
                {
                    case "h":
                        this._gsObjectHeight = Number(tokens[1]); 
                        break;
                }
            }
        }
    };
    
})(this);
