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
var canvasSizeW = Number( window.getComputedStyle( document.getElementById( 'webgl' ) ).width.replace( /[^0-9]/g, '' ) );
var canvasSizeH = Number( window.getComputedStyle( document.getElementById( 'webgl' ) ).width.replace( /[^0-9]/g, '' ) ) * 540 / 960;
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
var poseIndex = -1;
var video_bits = 5120;// 録画画像のビットレート、キロバイト
var video_time = 60000;// マイクロ秒

const filename = 'standing_pose_robokosan';
// 読み込むMMD 3Dモデルのファイル(PMXファイル)をオブジェクトで管理する
const PMX_FILE = { name: 'ロボ子さん', file: '../../assets/models/robokosan/hoodie_normal_gundam.pmx', emissive: 0.3, multiply: 0.0739, physics: true, receiveShadow: true, thickness: 0.001 };
// 読み込むモーションファイル(VMDファイル)をオブジェクトで管理する
const VMD_FILES = [ 
	{ name: 'じぶん3-1',  file: '../../assets/poses/jibun/3/1.vmd' }, 
	{ name: 'じぶん3-2',  file: '../../assets/poses/jibun/3/2.vmd' }, 
	{ name: 'じぶん3-3',  file: '../../assets/poses/jibun/3/3.vmd' }, 
	{ name: 'じぶん3-4',  file: '../../assets/poses/jibun/3/4.vmd' }, 
	{ name: 'じぶん3-5',  file: '../../assets/poses/jibun/3/5.vmd' }, 
	{ name: 'じぶん3-6',  file: '../../assets/poses/jibun/3/6.vmd' }, 
	{ name: 'じぶん3-7',  file: '../../assets/poses/jibun/3/7.vmd' }, 
	{ name: 'じぶん3-8',  file: '../../assets/poses/jibun/3/8.vmd' }, 
	{ name: 'じぶん3-9',  file: '../../assets/poses/jibun/3/9.vmd' }, 
	{ name: 'じぶん3-10', file: '../../assets/poses/jibun/3/10.vmd'}, 
	{ name: 'じぶん8-1',  file: '../../assets/poses/jibun/8/1.vmd' }, 
	{ name: 'じぶん8-2',  file: '../../assets/poses/jibun/8/2.vmd' }, 
	{ name: 'じぶん8-3',  file: '../../assets/poses/jibun/8/3.vmd' }, 
	{ name: 'じぶん8-4',  file: '../../assets/poses/jibun/8/4.vmd' }, 
	{ name: 'じぶん8-5',  file: '../../assets/poses/jibun/8/5.vmd' }, 
	{ name: 'じぶん8-6',  file: '../../assets/poses/jibun/8/6.vmd' }, 
	{ name: 'じぶん8-7',  file: '../../assets/poses/jibun/8/7.vmd' }, 
	{ name: 'じぶん8-8',  file: '../../assets/poses/jibun/8/8.vmd' }, 
	{ name: 'じぶん8-9',  file: '../../assets/poses/jibun/8/9.vmd' }, 
	{ name: 'じぶん8-10', file: '../../assets/poses/jibun/8/10.vmd'}, 
	{ name: 'じぶん15-1',  file: '../../assets/poses/jibun/15/1.vmd' }, 
	{ name: 'じぶん15-2',  file: '../../assets/poses/jibun/15/2.vmd' }, 
	{ name: 'じぶん15-3',  file: '../../assets/poses/jibun/15/3.vmd' }, 
	{ name: 'じぶん15-4',  file: '../../assets/poses/jibun/15/4.vmd' }, 
	{ name: 'じぶん15-5',  file: '../../assets/poses/jibun/15/5.vmd' }, 
	{ name: 'じぶん15-6',  file: '../../assets/poses/jibun/15/6.vmd' }, 
	{ name: 'じぶん15-7',  file: '../../assets/poses/jibun/15/7.vmd' }, 
	{ name: 'じぶん15-8',  file: '../../assets/poses/jibun/15/8.vmd' }, 
	{ name: 'じぶん15-9',  file: '../../assets/poses/jibun/15/9.vmd' }, 
	{ name: 'じぶん15-10', file: '../../assets/poses/jibun/15/10.vmd'}, 
	{ name: 'じぶん17-1',  file: '../../assets/poses/jibun/17/1.vmd' }, 
	{ name: 'じぶん17-2',  file: '../../assets/poses/jibun/17/2.vmd' }, 
	{ name: 'じぶん17-3',  file: '../../assets/poses/jibun/17/3.vmd' }, 
	{ name: 'じぶん17-4',  file: '../../assets/poses/jibun/17/4.vmd' }, 
	{ name: 'じぶん17-5',  file: '../../assets/poses/jibun/17/5.vmd' }, 
	{ name: 'じぶん17-6',  file: '../../assets/poses/jibun/17/6.vmd' }, 
	{ name: 'じぶん17-7',  file: '../../assets/poses/jibun/17/7.vmd' }, 
	{ name: 'じぶん17-8',  file: '../../assets/poses/jibun/17/8.vmd' }, 
	{ name: 'じぶん17-9',  file: '../../assets/poses/jibun/17/9.vmd' }, 
	{ name: 'じぶん17-10', file: '../../assets/poses/jibun/17/10.vmd'}, 
	{ name: 'じぶん20-1',  file: '../../assets/poses/jibun/20/1.vmd' }, 
	{ name: 'じぶん20-2',  file: '../../assets/poses/jibun/20/2.vmd' }, 
	{ name: 'じぶん20-3',  file: '../../assets/poses/jibun/20/3.vmd' }, 
	{ name: 'じぶん20-4',  file: '../../assets/poses/jibun/20/4.vmd' }, 
	{ name: 'じぶん20-5',  file: '../../assets/poses/jibun/20/5.vmd' }, 
	{ name: 'じぶん20-6',  file: '../../assets/poses/jibun/20/6.vmd' }, 
	{ name: 'じぶん20-7',  file: '../../assets/poses/jibun/20/7.vmd' }, 
	{ name: 'じぶん20-8',  file: '../../assets/poses/jibun/20/8.vmd' }, 
	{ name: 'じぶん20-9',  file: '../../assets/poses/jibun/20/9.vmd' }, 
	{ name: 'じぶん20-10', file: '../../assets/poses/jibun/20/10.vmd'}, 
	{ name: 'じぶん27-1',  file: '../../assets/poses/jibun/27/1.vmd' }, 
	{ name: 'じぶん27-2',  file: '../../assets/poses/jibun/27/2.vmd' }, 
	{ name: 'じぶん27-3',  file: '../../assets/poses/jibun/27/3.vmd' }, 
	{ name: 'じぶん27-4',  file: '../../assets/poses/jibun/27/4.vmd' }, 
	{ name: 'じぶん27-5',  file: '../../assets/poses/jibun/27/5.vmd' }, 
	{ name: 'じぶん27-6',  file: '../../assets/poses/jibun/27/6.vmd' }, 
	{ name: 'じぶん27-7',  file: '../../assets/poses/jibun/27/7.vmd' }, 
	{ name: 'じぶん27-8',  file: '../../assets/poses/jibun/27/8.vmd' }, 
	{ name: 'じぶん27-9',  file: '../../assets/poses/jibun/27/9.vmd' }, 
	{ name: 'じぶん27-10', file: '../../assets/poses/jibun/27/10.vmd'}, 
	{ name: 'じぶん31-1',  file: '../../assets/poses/jibun/31/1.vmd' }, 
	{ name: 'じぶん31-2',  file: '../../assets/poses/jibun/31/2.vmd' }, 
	{ name: 'じぶん31-3',  file: '../../assets/poses/jibun/31/3.vmd' }, 
	{ name: 'じぶん31-4',  file: '../../assets/poses/jibun/31/4.vmd' }, 
	{ name: 'じぶん31-5',  file: '../../assets/poses/jibun/31/5.vmd' }, 
	{ name: 'じぶん31-6',  file: '../../assets/poses/jibun/31/6.vmd' }, 
	{ name: 'じぶん31-7',  file: '../../assets/poses/jibun/31/7.vmd' }, 
	{ name: 'じぶん31-8',  file: '../../assets/poses/jibun/31/8.vmd' }, 
	{ name: 'じぶん31-9',  file: '../../assets/poses/jibun/31/9.vmd' }, 
	{ name: 'じぶん31-10', file: '../../assets/poses/jibun/31/10.vmd'} 
];


// 読み込むポーズファイル(VPDファイル)をオブジェクトで管理する
const VPD_FILES = [
	{ name: 'じぶん3-1',  file: '../../assets/poses/jibun/3/1.vpd' }, 
	{ name: 'じぶん3-2',  file: '../../assets/poses/jibun/3/2.vpd' }, 
	{ name: 'じぶん3-3',  file: '../../assets/poses/jibun/3/3.vpd' }, 
	{ name: 'じぶん3-4',  file: '../../assets/poses/jibun/3/4.vpd' }, 
	{ name: 'じぶん3-5',  file: '../../assets/poses/jibun/3/5.vpd' }, 
	{ name: 'じぶん3-6',  file: '../../assets/poses/jibun/3/6.vpd' }, 
	{ name: 'じぶん3-7',  file: '../../assets/poses/jibun/3/7.vpd' }, 
	{ name: 'じぶん3-8',  file: '../../assets/poses/jibun/3/8.vpd' }, 
	{ name: 'じぶん3-9',  file: '../../assets/poses/jibun/3/9.vpd' }, 
	{ name: 'じぶん3-10', file: '../../assets/poses/jibun/3/10.vpd'}, 
	{ name: 'じぶん8-1',  file: '../../assets/poses/jibun/8/1.vpd' }, 
	{ name: 'じぶん8-2',  file: '../../assets/poses/jibun/8/2.vpd' }, 
	{ name: 'じぶん8-3',  file: '../../assets/poses/jibun/8/3.vpd' }, 
	{ name: 'じぶん8-4',  file: '../../assets/poses/jibun/8/4.vpd' }, 
	{ name: 'じぶん8-5',  file: '../../assets/poses/jibun/8/5.vpd' }, 
	{ name: 'じぶん8-6',  file: '../../assets/poses/jibun/8/6.vpd' }, 
	{ name: 'じぶん8-7',  file: '../../assets/poses/jibun/8/7.vpd' }, 
	{ name: 'じぶん8-8',  file: '../../assets/poses/jibun/8/8.vpd' }, 
	{ name: 'じぶん8-9',  file: '../../assets/poses/jibun/8/9.vpd' }, 
	{ name: 'じぶん8-10', file: '../../assets/poses/jibun/8/10.vpd'}, 
	{ name: 'じぶん15-1',  file: '../../assets/poses/jibun/15/1.vpd' }, 
	{ name: 'じぶん15-2',  file: '../../assets/poses/jibun/15/2.vpd' }, 
	{ name: 'じぶん15-3',  file: '../../assets/poses/jibun/15/3.vpd' }, 
	{ name: 'じぶん15-4',  file: '../../assets/poses/jibun/15/4.vpd' }, 
	{ name: 'じぶん15-5',  file: '../../assets/poses/jibun/15/5.vpd' }, 
	{ name: 'じぶん15-6',  file: '../../assets/poses/jibun/15/6.vpd' }, 
	{ name: 'じぶん15-7',  file: '../../assets/poses/jibun/15/7.vpd' }, 
	{ name: 'じぶん15-8',  file: '../../assets/poses/jibun/15/8.vpd' }, 
	{ name: 'じぶん15-9',  file: '../../assets/poses/jibun/15/9.vpd' }, 
	{ name: 'じぶん15-10', file: '../../assets/poses/jibun/15/10.vpd'}, 
	{ name: 'じぶん17-1',  file: '../../assets/poses/jibun/17/1.vpd' }, 
	{ name: 'じぶん17-2',  file: '../../assets/poses/jibun/17/2.vpd' }, 
	{ name: 'じぶん17-3',  file: '../../assets/poses/jibun/17/3.vpd' }, 
	{ name: 'じぶん17-4',  file: '../../assets/poses/jibun/17/4.vpd' }, 
	{ name: 'じぶん17-5',  file: '../../assets/poses/jibun/17/5.vpd' }, 
	{ name: 'じぶん17-6',  file: '../../assets/poses/jibun/17/6.vpd' }, 
	{ name: 'じぶん17-7',  file: '../../assets/poses/jibun/17/7.vpd' }, 
	{ name: 'じぶん17-8',  file: '../../assets/poses/jibun/17/8.vpd' }, 
	{ name: 'じぶん17-9',  file: '../../assets/poses/jibun/17/9.vpd' }, 
	{ name: 'じぶん17-10', file: '../../assets/poses/jibun/17/10.vpd'}, 
	{ name: 'じぶん20-1',  file: '../../assets/poses/jibun/20/1.vpd' }, 
	{ name: 'じぶん20-2',  file: '../../assets/poses/jibun/20/2.vpd' }, 
	{ name: 'じぶん20-3',  file: '../../assets/poses/jibun/20/3.vpd' }, 
	{ name: 'じぶん20-4',  file: '../../assets/poses/jibun/20/4.vpd' }, 
	{ name: 'じぶん20-5',  file: '../../assets/poses/jibun/20/5.vpd' }, 
	{ name: 'じぶん20-6',  file: '../../assets/poses/jibun/20/6.vpd' }, 
	{ name: 'じぶん20-7',  file: '../../assets/poses/jibun/20/7.vpd' }, 
	{ name: 'じぶん20-8',  file: '../../assets/poses/jibun/20/8.vpd' }, 
	{ name: 'じぶん20-9',  file: '../../assets/poses/jibun/20/9.vpd' }, 
	{ name: 'じぶん20-10', file: '../../assets/poses/jibun/20/10.vpd'}, 
	{ name: 'じぶん27-1',  file: '../../assets/poses/jibun/27/1.vpd' }, 
	{ name: 'じぶん27-2',  file: '../../assets/poses/jibun/27/2.vpd' }, 
	{ name: 'じぶん27-3',  file: '../../assets/poses/jibun/27/3.vpd' }, 
	{ name: 'じぶん27-4',  file: '../../assets/poses/jibun/27/4.vpd' }, 
	{ name: 'じぶん27-5',  file: '../../assets/poses/jibun/27/5.vpd' }, 
	{ name: 'じぶん27-6',  file: '../../assets/poses/jibun/27/6.vpd' }, 
	{ name: 'じぶん27-7',  file: '../../assets/poses/jibun/27/7.vpd' }, 
	{ name: 'じぶん27-8',  file: '../../assets/poses/jibun/27/8.vpd' }, 
	{ name: 'じぶん27-9',  file: '../../assets/poses/jibun/27/9.vpd' }, 
	{ name: 'じぶん27-10', file: '../../assets/poses/jibun/27/10.vpd'}, 
	{ name: 'じぶん31-1',  file: '../../assets/poses/jibun/31/1.vpd' }, 
	{ name: 'じぶん31-2',  file: '../../assets/poses/jibun/31/2.vpd' }, 
	{ name: 'じぶん31-3',  file: '../../assets/poses/jibun/31/3.vpd' }, 
	{ name: 'じぶん31-4',  file: '../../assets/poses/jibun/31/4.vpd' }, 
	{ name: 'じぶん31-5',  file: '../../assets/poses/jibun/31/5.vpd' }, 
	{ name: 'じぶん31-6',  file: '../../assets/poses/jibun/31/6.vpd' }, 
	{ name: 'じぶん31-7',  file: '../../assets/poses/jibun/31/7.vpd' }, 
	{ name: 'じぶん31-8',  file: '../../assets/poses/jibun/31/8.vpd' }, 
	{ name: 'じぶん31-9',  file: '../../assets/poses/jibun/31/9.vpd' }, 
	{ name: 'じぶん31-10', file: '../../assets/poses/jibun/31/10.vpd'} 
];



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

