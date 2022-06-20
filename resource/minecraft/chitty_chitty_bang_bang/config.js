//***********************************************************************************************
// 変数設定
//***********************************************************************************************
var camera = {};
var controls = {};
var effect = {};
var light = {};
var mesh = {};
var renderer = {};
var scene = {};
//var canvasSizeW = Number( window.getComputedStyle( document.getElementById( 'webgl' ) ).width.replace( /[^0-9]/g, '' ) );
//var canvasSizeH = Number( window.getComputedStyle( document.getElementById( 'webgl' ) ).width.replace( /[^0-9]/g, '' ) );
var canvasSizeW = 400;
var canvasSizeH = 400;
// ステレオ表示に関する変数
var stereoSwitch = 0;
var radius = 4.2;// カメラ距離
var phiRadian = 90 * Math.PI / 180;
var thetaRadian = 90 * Math.PI / 180;
var vector11 = {};
var vector12 = {};
var vector13 = {};
var vector14 = {};
var pupillaryDistance1 = 0;
var pupillaryDistance2 = 0.032;
var isDragging = false;
var isTouching = false;
var baseX = 0;
var baseY = 0;
var baseRadius = 0;
var basePhiRadian = 0;
var baseThetaRadian = 0;
var touchCount = 0;
// WebM動画ファイルの保存に関する変数
var isRecording = false;
var mediaRecorder = {};

var animationMixer = {};
var motions = [];
// モーションのインデックス、-1の時はモーションは適用されていないことを示す
var motionIndex = -1;
// ポーズのインデックス、-1の時はポーズは適用されていないことを示す
//var poseIndex = -1;

// 読み込むモーションファイル(VMDファイル)をオブジェクトで管理する
var VMD_FILE = { name: 'マフティーダンス', file: '../assets/motions/chitty_chitty_bang_bang.vmd' };
var video_bits = 3072;// 録画画像のビットレート、キロバイト
var video_time = 23100;// マイクロ秒


(function(m){var s='';for(var i=0;i<m.length;i++){s+='<script type="text/javascript" src="'+m[i]+'"></s'+'cript>'+"\n";}document.write(s);})([
	'../../assets/js/three.js',
	'../../assets/js/MMDToonShader.js',
	'../../assets/js/mmdparser.js',
	'../../assets/js/TGALoader.js',
	'../../assets/js/OutlineEffect.js',
	'../../assets/js/MMDLoader.js',
	'../../assets/js/ammo.js',
	'../../assets/js/CCDIKSolver.js',
	'../../assets/js/MMDPhysics.js',
	'../../assets/js/MMDAnimationHelper.js',
	'../../assets/js/jquery.min.js',
	'script.js'
]);



