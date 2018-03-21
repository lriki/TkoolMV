
### 移動ルート vs jump 直接実行
崖ジャンプを移動ルートとして実装する場合、イベントなど基本的に移動ルートで移動するものについてはすでに動いているものをオーバーライドするかコマンド挿入しなければならない。

あと、オブジェクトへ乗るときはどうする？




### Game_CharacterBase.prototype.update
移動系の偉い人。状態によって updateMove や updateJump を呼ぶ


Game_Player.prototype.getInputDirection


### moveStraight
これが一番基本的な移動開始みたい。

HalfMode も Game_Player.prototype.executeMove をオーバーライドしてるけど、
４方向移動時はこれを呼び出す。

### Game_Map.prototype.isPassable(x, y, d)
論理座標 xy から d 方向に出られるか

