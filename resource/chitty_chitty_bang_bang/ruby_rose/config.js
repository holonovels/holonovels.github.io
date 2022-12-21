//***********************************************************************************************
// 変数設定
//***********************************************************************************************
var camera = {};
var controls = {};
var effect = {};
var light = {};
var mesh = {x:0,y:600,z:0};
var renderer = {};
var scene = {};
var canvasSizeW = 1920;
var canvasSizeH = 1080;
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
var mabatakiIndex = 0;

// ポーズのインデックス、-1の時はポーズは適用されていないことを示す
//var poseIndex = -1;
// 読み込むMMD 3Dモデルのファイル(PMXファイル)をオブジェクトで管理するemissive:放射、thickness:厚さ
var PMX_FILE = { name: 'RWBYルビー・ローズ', file: '../../assets/models/ruby_rose/ruby_rose.pmx', emissive: 0.3, multiply: 0.0739, physics: true, receiveShadow: true, thickness: 0.001 };
//const PMX_FILE = { name: 'ロボ子さん', file: '../../assets/models/ruby_rose/ruby_rose.pmx', emissive: 0.6, multiply: 0.0739, physics: true, receiveShadow: true, thickness: 0.002 };
// 読み込むモーションファイル(VMDファイル)をオブジェクトで管理する
var VMD_FILE = { name: 'チキチキバンバン', file: '../../assets/motions/chitty_chitty_bang_bang_sing.vmd' };
var filename = 'chitty_chitty_bang_bang_sing_ruby_rose';
var ragtime = 1.1;
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

