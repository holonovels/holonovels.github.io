//------------------------------------------------------------------------------
// スワイプ
$(function () {
	$("html").on("touchstart", start_check);
	$("html").on("touchmove", move_check);
});

function start_check(e){
	// 現在の座標取得
	posiY = getY(e);
	posiX = getX(e);

	// 移動距離状態を初期化
	moveY = '';
	moveX = '';
}

function move_check(e){
	if (posiX - getX(e) > 70){$("html").trigger({type: 'keydown', keyCode: 39});}// 右→左:Key[→]
	else if (posiX - getX(e) < -70){$("html").trigger({type: 'keydown', keyCode: 37});}// 左→右:Key[←]

	if (posiY - getY(e) > 70){$("html").trigger({type: 'keydown', keyCode: 40});}// 下→上:Key[↓]
	else if (posiY - getY(e) < -70){$("html").trigger({type: 'keydown', keyCode: 38})}// 上→下:Key[↑]

}
// 座標取得処理
function getY(e){return (e.originalEvent.touches[0].pageY);}// 縦方向の座標を取得
function getX(e){return (e.originalEvent.touches[0].pageX);}// 横方向の座標を取得

//------------------------------------------------------------------------------
// ゲームパッド
var axh = 0;
var axv = 0;
var bt = [];
function loop() {

	gamepads = navigator.getGamepads();
	gp = gamepads[0];

	// ボタン検知
	if(gp.buttons[0].pressed) {if(bt[0]==0) {bt[0]=1;$("html").trigger({type: 'keydown', keyCode: 13});}} else bt[0]=0;// Aボタン:Key[ENTER]
	if(gp.buttons[1].pressed) {}//  Bボタン
	if(gp.buttons[2].pressed) {if(bt[2]==0) {bt[2]=1;$("html").trigger({type: 'keydown', keyCode: 17});}} else bt[2]=0;// Xボタン:Key[CTR]
	if(gp.buttons[3].pressed) {if(bt[3]==0) {bt[3]=1;$("html").trigger({type: 'keydown', keyCode: 32});}} else bt[3]=0;// Yボタン:Key[SPACE]
	if(gp.buttons[4].pressed) {}//  LBボタン
	if(gp.buttons[5].pressed) {}//  RBボタン
	if(gp.buttons[6].pressed) {}//  LTボタン
	if(gp.buttons[7].pressed) {}//  RTボタン
	if(gp.buttons[8].pressed) {}//  BACKボタン
	if(gp.buttons[9].pressed) {}//  STARTボタン
	if(gp.buttons[10].pressed) {}// L3ボタン
	if(gp.buttons[11].pressed) {}// R3ボタン
	if(gp.buttons[12].pressed) {}// UPボタン
	if(gp.buttons[13].pressed) {}// DOWNボタン
	if(gp.buttons[14].pressed) {}// LEFTボタン
	if(gp.buttons[15].pressed) {}// RIGHTボタン
	//if(gp.buttons[16].pressed) {}// HOMEボタン

	// 十字キー検知
	if(gp.axes[0]==-1) {// 十字キー左
		if(axh==0){ 
			axh += gp.axes[0];
			$("html").trigger({type: 'keydown', keyCode: 37});// Key[←]
		}
	} else if(gp.axes[0]==1) {// 十字キー右
		if(axh==0){ 
			axh += gp.axes[0];
			$("html").trigger({type: 'keydown', keyCode: 39});// Key[→]
		}
	} else {axh = 0;}

	if(gp.axes[1]==-1) {// 十字キー上
		if(axv==0){ 
			axv += gp.axes[1];
			$("html").trigger({type: 'keydown', keyCode: 38});// Key[↑]
		}
	} else if(gp.axes[1]==1) {// 十字キー下
		if(axv==0){ 
			axv += gp.axes[1];
			$("html").trigger({type: 'keydown', keyCode: 40});// Key[↓]
		}
	} else {axv = 0;}

	requestAnimationFrame(loop);
}

window.addEventListener("gamepadconnected", loop);// ゲームパッドが接続されたらloop開始
if(!window.ongamepadconnected) loop();// Chromeはイベントが起きないので直接loop実行