//┌──────────────────────────────────────
//│  ファンクションライブラリ
//└──────────────────────────────────────
//==============================================================================
var vector3a = new THREE.Vector3();
var baseVector3a = new THREE.Vector3();
var baseVector2a = new THREE.Vector2();

var vector3b = new THREE.Vector3();
var baseVector3b = new THREE.Vector3();
var baseVector2b = new THREE.Vector2();

// MMD 3Dモデルのモーションに関連する変数
var ANIMATION_HELPER = new THREE.MMDAnimationHelper();
var CLOCK = new THREE.Clock();

$(function () {

	$("#webgl").css({marginTop: "50px"});
	$("#webgl").css({overflow: "hidden"});
	$("#webgl").width(canvasSizeW);
	$("#webgl").height(canvasSizeH);
	resizeWindow();
	window.addEventListener('resize', resizeWindow);

	$('#morph_open').on('click',function(){
		$('#morph').fadeIn();
		return false;
	});
	$('#morph .modal_close').on('click',function(){
		$('#morph').fadeOut();
		return false;
	});

	$('#pose_open').on('click',function(){
		$('#pose').fadeIn();
		return false;
	});
	$('#pose .modal_close').on('click',function(){
		$('#pose').fadeOut();
		return false;
	});

//------------------------------------------------------------------------------
	// Ammo の 「Ammo.btDefaultCollisionConfiguration is not a function」 のエラー回避
	Ammo().then( function ( AmmoLib ) {
		Ammo = AmmoLib;
		// (1) シーンの準備
		prepareScene();
		// (2) MMD 3Dモデルをロードし、シーンに追加
		loadMMD();
		// (3) レンダリング (レンダリングループ)
		sceneRender();
	} );
//------------------------------------------------------------------------------
});



//-----------------------------------------------------------------------------------------------
// (1)シーンの準備
//-----------------------------------------------------------------------------------------------
function prepareScene() {
	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
	//renderer = new THREE.WebGLRenderer( { antialias: false } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( canvasSizeW, canvasSizeH );
	renderer.setClearColor( 0x00ff00, 0.0 );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	document.getElementById( 'webgl' ).appendChild( renderer.domElement );
	effect = new THREE.OutlineEffect( renderer );
	scene = new THREE.Scene();
	scene.add( new THREE.AmbientLight( 0xffffff, 0.6 ) );
	light = new THREE.DirectionalLight( 0xffe2b9, 0.4 );
	light.castShadow = true;
	light.position.copy( new THREE.Vector3( 3, 2, 6 ) );
	light.shadow.mapSize.copy( new THREE.Vector2 ( Math.pow( 2, 10 ), Math.pow( 2, 10 ) ) );
	light.shadow.focus = 1;
	light.shadow.normalBias = 0.02;
	light.shadow.bias = -0.0005;
	light.shadow.camera.left = -5;
	light.shadow.camera.right = 5;
	light.shadow.camera.top = 5;
	light.shadow.camera.bottom = -5;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 20;
	scene.add( light );
	scene.add( light.target );
	camera = new THREE.PerspectiveCamera( 22.9, canvasSizeW / canvasSizeH, 0.1, 20 );
	const GROUND_MESH = new THREE.Mesh( new THREE.PlaneGeometry( 10, 10, 1, 1 ), new THREE.ShadowMaterial( { opacity: 0.25 } ) );
	GROUND_MESH.geometry.rotateX( -90 * Math.PI / 180 );
	GROUND_MESH.receiveShadow = true;
	//scene.add( GROUND_MESH );// 地面表示
	//scene.add( new THREE.GridHelper( 8, 20, 0x000000, 0x999999 ) );// グリッド表示
	//scene.add( new THREE.AxesHelper( 4 ) );// 角度表示
}

//-----------------------------------------------------------------------------------------------
// (2) MMD 3Dモデルをロードし、シーンに追加
//-----------------------------------------------------------------------------------------------
function loadMMD () {
	const LOADER_1 = new THREE.MMDLoader();
	const LOADER_2 = new THREE.MMDLoader();
	LOADER_1.load (
		// オブジェクトで管理しているMMD 3Dモデルのファイル(PMXファイル)のファイル名プロパティーを使用
		PMX_FILE_A.file,
		function ( mesh ) {
			//let mesh = mmd;
			// オブジェクトで管理しているMMD 3Dモデルのファイル(PMXファイル)の放出度および輪郭線の太さのプロパティーを使用
			for ( let i = 0; i < mesh.material.length; i ++ ) {
				mesh.material[ i ].emissive.multiplyScalar( PMX_FILE_A.emissive );
				mesh.material[ i ].userData.outlineParameters.thickness = PMX_FILE_A.thickness;
			}
			// オブジェクトで管理しているMMD 3Dモデルのファイル(PMXファイル)のセルフシャドウ(receiveShadow)のプロパティーを使用
			mesh.castShadow = true;
			if ( PMX_FILE_A.receiveShadow ) {
				mesh.receiveShadow = true;
			} else {
				mesh.receiveShadow = false;
			}
			// オブジェクトで管理しているMMD 3Dモデルのファイル(PMXファイル)の倍率のプロパティーを使用
			mesh.scale.copy( new THREE.Vector3( 1, 1, 1 ).multiplyScalar( PMX_FILE_A.multiply ) );
			const BOUNDING_BOX = new THREE.Box3().setFromObject( mesh );
			vector3a.setY( 0.825 * BOUNDING_BOX.max.y );// カメラの高さ？
			vector3a.setX( -0.3 * BOUNDING_BOX.max.x );// カメラの横？
			light.target.position.copy( new THREE.Vector3( 0, 0.5 * BOUNDING_BOX.max.y, 0 ) );
			// モーションファイル(VMDファイル)を読み込んで、AnimationClip(配列で管理する)を作成

			LOADER_2.loadAnimation( VMD_FILE_A.file, mesh, function ( motion ) {
				// モーションファイルはAnimationClipとして読み込まれる、配列に保存
				motions_a[0] = motion;
				// AnimationClipのnameプロパティーの設定
				motions_a[0].name = VMD_FILE_A.name;
			} );

			// オブジェクトで管理しているMMD 3Dモデルのファイル(PMXファイル)の物理演算のプロパティーを使用 物理演算あり(true) / 物理演算なし(false) 
			if ( PMX_FILE_A.physics ) {
				// (Constructor) MMDAnimationHelper( params : Object )
				// (Method) .add ( object : Object3D, params : Object ) : MMDAnimationHelper
				ANIMATION_HELPER.add( mesh, { animation: motions_a, physics: true } );
			} else {
				ANIMATION_HELPER.add( mesh, { animation: motions_a, physics: false } );
			}
			// 再生、停止、一時停止を制御するための AnimationMixer を取得
			// (Property) .objects : WeakMap
			animationMixer_a = ANIMATION_HELPER.objects.get( mesh ).mixer;
			// AnimationHelperにより開始したモーションを停止する
			// (Method) .stopAllAction () : AnimationMixer

			animationMixer_a.stopAllAction();

			LOADER_2.loadVPD( VPD_FILE_A.file, false, function ( pose ) {
				// (Method) .pose ( mesh : SkinnedMesh, vpd : Object, params : Object ) : MMDAnimationHelper
				ANIMATION_HELPER.pose( mesh, pose, { resetPose: true, ik: true, grant: true } );
			} );

			// 立ち位置
			//mesh.skeleton.bones[0].position.x = -1.5;
			//mesh.skeleton.bones[0].position.z = 19.5;
			scene.add( mesh );




			// ランダムまばたき開始
			blink(mesh, mabatakiIndex);
		}
	);

	const LOADER_3 = new THREE.MMDLoader();
	const LOADER_4 = new THREE.MMDLoader();
	LOADER_3.load (
		// オブジェクトで管理しているMMD 3Dモデルのファイル(PMXファイル)のファイル名プロパティーを使用
		PMX_FILE_B.file,
		function ( mesh ) {
			//let mesh = mmd;
			// オブジェクトで管理しているMMD 3Dモデルのファイル(PMXファイル)の放出度および輪郭線の太さのプロパティーを使用
			for ( let i = 0; i < mesh.material.length; i ++ ) {
				mesh.material[ i ].emissive.multiplyScalar( PMX_FILE_B.emissive );
				mesh.material[ i ].userData.outlineParameters.thickness = PMX_FILE_B.thickness;
			}
			// オブジェクトで管理しているMMD 3Dモデルのファイル(PMXファイル)のセルフシャドウ(receiveShadow)のプロパティーを使用
			mesh.castShadow = true;
			if ( PMX_FILE_B.receiveShadow ) {
				mesh.receiveShadow = true;
			} else {
				mesh.receiveShadow = false;
			}
			// オブジェクトで管理しているMMD 3Dモデルのファイル(PMXファイル)の倍率のプロパティーを使用
			mesh.scale.copy( new THREE.Vector3( 1, 1, 1 ).multiplyScalar( PMX_FILE_B.multiply ) );
			const BOUNDING_BOX = new THREE.Box3().setFromObject( mesh );
			vector3b.setY( 0.36 * BOUNDING_BOX.max.y );// カメラの高さ？
			//light.target.position.copy( new THREE.Vector3( 0, 0.5 * BOUNDING_BOX.max.y, 0 ) );
			// モーションファイル(VMDファイル)を読み込んで、AnimationClip(配列で管理する)を作成

			LOADER_4.loadAnimation( VMD_FILE_B.file, mesh, function ( motion ) {
				// モーションファイルはAnimationClipとして読み込まれる、配列に保存
				motions_b[0] = motion;
				// AnimationClipのnameプロパティーの設定
				motions_b[0].name = VMD_FILE_B.name;
			} );

			// オブジェクトで管理しているMMD 3Dモデルのファイル(PMXファイル)の物理演算のプロパティーを使用 物理演算あり(true) / 物理演算なし(false) 
			if ( PMX_FILE_B.physics ) {
				// (Constructor) MMDAnimationHelper( params : Object )
				// (Method) .add ( object : Object3D, params : Object ) : MMDAnimationHelper
				ANIMATION_HELPER.add( mesh, { animation: motions_b, physics: true } );
			} else {
				ANIMATION_HELPER.add( mesh, { animation: motions_b, physics: false } );
			}
			// 再生、停止、一時停止を制御するための AnimationMixer を取得
			// (Property) .objects : WeakMap
			animationMixer_b = ANIMATION_HELPER.objects.get( mesh ).mixer;
			// AnimationHelperにより開始したモーションを停止する
			// (Method) .stopAllAction () : AnimationMixer
			animationMixer_b.stopAllAction();

			LOADER_4.loadVPD( VPD_FILE_B.file, false, function ( pose ) {
				// (Method) .pose ( mesh : SkinnedMesh, vpd : Object, params : Object ) : MMDAnimationHelper
				ANIMATION_HELPER.pose( mesh, pose, { resetPose: true, ik: true, grant: true } );
			} );

			// 立ち位置
			//mesh.skeleton.bones[0].position.x = 7;
			//mesh.skeleton.bones[0].position.z = -2.5;
			scene.add( mesh );

			// ランダムまばたき開始
			blink(mesh, mabatakiIndex);
		}
	);

	// サイズを表示
	$("header>p").html("(WxH:"+canvasSizeW+"x"+canvasSizeH+")");


}

//-----------------------------------------------------------------------------------------------
// (3)レンダリング (レンダリングループ)
//-----------------------------------------------------------------------------------------------
function sceneRender() {
	window.requestAnimationFrame( sceneRender );
	// ポーズの場合、MMDAnimationHelperのupdateは行わない。
	// モーションの場合は、時間を進めて、オブジェクトのアニメーションを更新する
	if ( motionIndex !== -1 ) {
		// (Method) .update ( delta : Number ) : MMDAnimationHelper
		ANIMATION_HELPER.update( CLOCK.getDelta() );
	}
	cameraPosition();
	camera.position.copy( vector11 );
	camera.lookAt( vector12 );
	effect.render( scene, camera );
}

//-----------------------------------------------------------------------------------------------
// ランダムまばたき
//-----------------------------------------------------------------------------------------------
async function blink(mesh, idx) {
	mesh.morphTargetInfluences[idx] = 1;// まばたき
	await sleep(0.05);
	mesh.morphTargetInfluences[idx] = 0;
	setTimeout(blink, Math.floor(Math.random()*11000), mesh, idx);
}

//***********************************************************************************************
// ライブラリー
//***********************************************************************************************

//-----------------------------------------------------------------------------------------------
// カメラの位置、視点(LookAt)の場所計算
//-----------------------------------------------------------------------------------------------
function cameraPosition() {
	vector12 = new THREE.Vector3( Math.cos( phiRadian + Math.PI / 2 ), 0, Math.sin( phiRadian + Math.PI / 2 ) ).multiplyScalar( pupillaryDistance1 );
	vector12.add( vector3a );
	vector14 = new THREE.Vector3( Math.cos( phiRadian - Math.PI / 2 ), 0, Math.sin( phiRadian - Math.PI / 2 ) ).multiplyScalar( pupillaryDistance1 );
	vector14.add( vector3a );
	vector11 = vector12.clone();
	vector11.add( new THREE.Vector3( Math.sin( thetaRadian ) * Math.cos( phiRadian ), Math.cos( thetaRadian ), Math.sin( thetaRadian ) * Math.sin( phiRadian ) ).multiplyScalar( radius ) );
	vector13 = vector14.clone();
	vector13.add( new THREE.Vector3( Math.sin( thetaRadian ) * Math.cos( phiRadian ), Math.cos( thetaRadian ), Math.sin( thetaRadian ) * Math.sin( phiRadian ) ).multiplyScalar( radius ) );
}

//***********************************************************************************************
// イベント
//***********************************************************************************************

//-----------------------------------------------------------------------------------------------
// ブラウザー（ウィンドウ）のサイズ変更時の処理
//-----------------------------------------------------------------------------------------------
window.addEventListener( 'resize', function () {
	// setScissorとsetViewportで使用する変数（canvasSizeW、canvasSizeH）の値を更新
	canvasSizeW = Number( window.getComputedStyle( document.getElementById( 'webgl' ) ).width.replace( /[^0-9]/g, '' ) );
	canvasSizeH = Number( window.getComputedStyle( document.getElementById( 'webgl' ) ).width.replace( /[^0-9]/g, '' ) ) * 540 / 960;
	effect.setSize( canvasSizeW, canvasSizeH );
}, false );

//-----------------------------------------------------------------------------------------------
// 一時停止ボタン
//-----------------------------------------------------------------------------------------------
$('#pause').on('click',function(){
	 // モーションの開始
	if ( motionIndex === 0 && animationMixer_a.clipAction( motions_a[0] ).paused === false && animationMixer_b.clipAction( motions_b[0] ).paused === false ) {
		// モーションの一時停止
		// (Property) .paused : Boolean
		animationMixer_a.clipAction( motions_a[0] ).paused = true;
		animationMixer_b.clipAction( motions_b[0] ).paused = true;
		player.pauseVideo();
	} else if ( motionIndex === 0 && animationMixer_a.clipAction( motions_a[0] ).paused === true && animationMixer_b.clipAction( motions_b[0] ).paused === true ) {
		// モーションの一時停止から再開
		animationMixer_a.clipAction( motions_a[0] ).paused = false;
		animationMixer_b.clipAction( motions_b[0] ).paused = false;
		//player.seekTo(ragtime+animationMixer.time, true);
		player.playVideo();
	}
	return false;
});

//-----------------------------------------------------------------------------------------------
// モーションの開始
//-----------------------------------------------------------------------------------------------
$('#play').on('click',async function(){





	animationMixer_a.clipAction( motions_a[0] ).reset();
	animationMixer_b.clipAction( motions_b[0] ).reset();

	animationMixer_a.clipAction( motions_a[0] ).play();
	animationMixer_b.clipAction( motions_b[0] ).play();

	animationMixer_a.clipAction( motions_a[0] ).setLoop( THREE.LoopOnce );
	animationMixer_b.clipAction( motions_b[0] ).setLoop( THREE.LoopOnce );

	//player.playVideo();
	player.seekTo(ragtime, true);
	while (player.getCurrentTime() < ragtime || player.getPlayerState() != 1) await sleep(0.01);
	motionIndex = 0;

	while (animationMixer_a.time==0||animationMixer_b.time==0){ 
		if(player.getPlayerState() != 2) player.pauseVideo();
		await sleep(0.01);
		if(animationMixer_a.time>0&&animationMixer_b.time>0){
			player.seekTo(animationMixer_a.time, true);
			player.seekTo(animationMixer_b.time, true);
			player.playVideo();
			//console.log("time"+animationMixer_a.time);
		}

	}
	return false;
});

//-----------------------------------------------------------------------------------------------
// 画面上でのドラッグの開始/終了
//-----------------------------------------------------------------------------------------------
document.getElementById( 'webgl' ).addEventListener( 'pointerdown', function ( event ) {
	event.preventDefault();
	isDragging = true;
	baseX = event.clientX;
	baseY = event.clientY;
	basePhiRadian = phiRadian;
	baseThetaRadian = thetaRadian;
	baseVector3a = vector3a.clone();
	baseVector3b = vector3b.clone();
	if ( event.buttons === 4 ) {
		radius = 4.5;
	}
}, false );

document.getElementById( 'webgl' ).addEventListener( 'pointerup', function () {
	if ( isDragging === true ) {
		isDragging = false;
	}
}, false );

document.getElementById( 'webgl' ).addEventListener( 'pointerout', function () {
	if ( isDragging === true ) {
		isDragging = false;
	}
}, false );

//-----------------------------------------------------------------------------------------------
// 画面上でのドラッグ操作
//-----------------------------------------------------------------------------------------------
document.getElementById( 'webgl' ).addEventListener( 'pointermove' , function ( event ) {
	event.preventDefault();
	if ( isDragging === true ) {
		if ( event.buttons === 1 ){
			phiRadian = basePhiRadian + ( 2 * Math.PI / this.clientWidth ) * ( event.clientX - baseX );
			if ( thetaRadian >= 5 * Math.PI / 180 && thetaRadian <= 175 * Math.PI / 180 ) {
				thetaRadian = baseThetaRadian - ( Math.PI / this.clientHeight ) * ( event.clientY - baseY );
			} else if ( thetaRadian < 5 * Math.PI / 180 && event.movementY < 0 ) {
				thetaRadian = 5 * Math.PI / 180;
				baseThetaRadian = 5 * Math.PI / 180;
				baseY = event.clientY;
			} else if ( thetaRadian > 175 * Math.PI / 180 && event.movementY > 0 ) {
				thetaRadian = 175 * Math.PI / 180;
				baseThetaRadian = 175 * Math.PI / 180;
				baseY = event.clientY;
			}
		} else if ( event.buttons === 2 ) {
			vector3a.x = baseVector3a.x - radius * ( 0.709 / this.clientWidth ) * Math.sin( phiRadian ) * ( event.clientX - baseX );
			vector3a.y = baseVector3a.y + radius * ( 0.709 / this.clientWidth ) * ( event.clientY - baseY );
			vector3a.z = baseVector3a.z + radius * ( 0.709 / this.clientWidth ) * Math.cos( phiRadian ) * ( event.clientX - baseX );

			vector3b.x = baseVector3b.x - radius * ( 0.709 / this.clientWidth ) * Math.sin( phiRadian ) * ( event.clientX - baseX );
			vector3b.y = baseVector3b.y + radius * ( 0.709 / this.clientWidth ) * ( event.clientY - baseY );
			vector3b.z = baseVector3b.z + radius * ( 0.709 / this.clientWidth ) * Math.cos( phiRadian ) * ( event.clientX - baseX );
		}
	}
}, false );

//-----------------------------------------------------------------------------------------------
// 右クリックを離した時にメニューを表示させない
//-----------------------------------------------------------------------------------------------
document.getElementById( 'webgl' ).addEventListener( 'contextmenu', function ( event ) {
	event.preventDefault();
}, false );

//-----------------------------------------------------------------------------------------------
// 画面上でのマウスホイールの操作
//-----------------------------------------------------------------------------------------------
document.getElementById( 'webgl' ).addEventListener( 'wheel', function ( event ) {
	event.preventDefault();
	radius += 0.001 * event.deltaY;
}, false );

//-----------------------------------------------------------------------------------------------
// 画面上でのタッチ操作の開始/終了
//-----------------------------------------------------------------------------------------------
document.getElementById( 'webgl' ).addEventListener( 'touchstart', function ( event ) {
	event.preventDefault();
	if ( event.touches.length === 1 ) {
		if ( touchCount === 0 ) {
			touchCount ++;
			setTimeout( function () {
				touchCount = 0;
			}, 400 );
		} else {
			radius = 4.5;
			touchCount = 0;
		}
	} else if ( event.touches.length > 1 ) {
		isDragging = false;
		isTouching = true;
		baseVector2.x = event.touches[ 1 ].pageX - event.touches[ 0 ].pageX;
		baseVector2.y = event.touches[ 1 ].pageY - event.touches[ 0 ].pageY;
		baseX = event.touches[ 0 ].pageX;
		baseY = event.touches[ 0 ].pageY;
		baseRadius = radius;
		baseVector3a = vector3a.clone();
		baseVector3b = vector3b.clone();
	}
}, false);
document.getElementById( 'webgl' ).addEventListener( 'touchend', function ( event ) {
	event.preventDefault();
	isTouching = false;
}, false);

//-----------------------------------------------------------------------------------------------
// 画面上でのタッチ操作、ピンチイン、ピンチアウトの操作
//-----------------------------------------------------------------------------------------------
document.getElementById( 'webgl' ).addEventListener( 'touchmove', function ( event ) {
	event.preventDefault();
	if ( isTouching === true ) {
		const x1 = event.touches[ 0 ].pageX;
		const y1 = event.touches[ 0 ].pageY;
		const x2 = event.touches[ 1 ].pageX;
		const y2 = event.touches[ 1 ].pageY;
		const vector2 = new THREE.Vector2( x2 - x1, y2 - y1 );
		const deltaDistance = vector2.length() - baseVector2.length();
		radius = baseRadius - 0.01 * deltaDistance;
		vector3a.x = baseVector3a.x - radius * ( 0.709 / this.clientWidth ) * Math.sin( phiRadian ) * ( x1 - baseX );
		vector3a.y = baseVector3a.y + radius * ( 0.709 / this.clientWidth ) * ( y1 - baseY );
		vector3a.z = baseVector3a.z + radius * ( 0.709 / this.clientWidth ) * Math.cos( phiRadian ) * ( x1 - baseX );

		vector3b.x = baseVector3b.x - radius * ( 0.709 / this.clientWidth ) * Math.sin( phiRadian ) * ( x1 - baseX );
		vector3b.y = baseVector3b.y + radius * ( 0.709 / this.clientWidth ) * ( y1 - baseY );
		vector3b.z = baseVector3b.z + radius * ( 0.709 / this.clientWidth ) * Math.cos( phiRadian ) * ( x1 - baseX );
	}
}, false );

//-----------------------------------------------------------------------------------------------
// PNG画像保存ボタン
//-----------------------------------------------------------------------------------------------
$('#save_png').on('click',function(){
	renderer.domElement.getContext( 'webgl2', { antialias: true, preserveDrawingBuffer: true } );
	camera.position.copy( vector11 );
	camera.lookAt( vector12 );
	effect.render( scene, camera );
	renderer.setClearAlpha(0.0);
	renderer.domElement.toBlob( function ( blob ) {
		const BLOB_URL = URL.createObjectURL( blob );
		const A = document.createElement( 'a' );
		A.download = filename+'.png';
		A.href = BLOB_URL;
		A.click();
		URL.revokeObjectURL( BLOB_URL );
	}, 'image/png' );

	renderer.domElement.getContext( 'webgl2', { antialias: true, preserveDrawingBuffer: false });
	return false;
});

//-----------------------------------------------------------------------------------------------
// イベント WebM動画保存ボタン
//-----------------------------------------------------------------------------------------------
$('#save_webm').on('click',function(){
	if ( isRecording === false ) {

		$('#player').hide();
		player.stopVideo();

		$('#save_webm').html('録画停止');
		isRecording = true;
		renderer.setClearAlpha(1.0);
		const MEDIA_STREAM = renderer.domElement.captureStream( 24 );
		// video /webm; codecs= vp8、opus ：ChromeとFirefoxでは正常に動作しますが、Safariでは動作しません
		// video /mp4; codecs：h264 ：SafariとChromeで動作しますが、Firefoxでは動作しません//videoBitsPerSecond 512kbits / sec
		//mediaRecorder = new MediaRecorder( MEDIA_STREAM, { mimeType: 'video/webm;codecs=vp8', videoBitsPerSecond: 3072*1000  } );

		let media_param = {};
		let userAgent = window.navigator.userAgent;
		if(userAgent.indexOf('Chrome') != -1 || userAgent.indexOf('Safari') != -1) {
			// h264はchrome safariのみ
			media_param = {mimeType:'video/webm;codecs=h264', videoBitsPerSecond:video_bits*1000};
		} else if(userAgent.indexOf('Firefox') != -1) {
			console.log("vp8");
			media_param = {mimeType:'video/webm;codecs=vp8', videoBitsPerSecond:video_bits*1000};
		} else {
			media_param = {mimeType:'video/webm', videoBitsPerSecond:video_bits*1000};
		}
		mediaRecorder = new MediaRecorder( MEDIA_STREAM, media_param );

		//recorder.start(1000); // 1000ms 毎に録画データを区切る
		mediaRecorder.start();
		window.setTimeout( function() {
			if ( isRecording === true ) {
				$('#save_webm').html('WebM動画録画');
				isRecording = false;
				mediaRecorder.stop();

				animationMixer_a.clipAction( motions_a[0] ).stop();
				animationMixer_b.clipAction( motions_b[0] ).stop();
				renderer.setClearAlpha(0.0);
			}
		}, video_time );


		mediaRecorder.ondataavailable = function ( event ) {
			const BLOB_URL = URL.createObjectURL( new Blob( [ event.data ], { type: event.data.type } ) );
			const A = document.createElement( 'a' );
			A.download = filename+'.webm';
			A.href = BLOB_URL;
			A.click();
			URL.revokeObjectURL( BLOB_URL );
		};
		// VPDファイルを読込ためのMMDLoader
		const LOADER_1 = new THREE.MMDLoader();
		// ポーズ用のMMDAnimationHelperオブジェクト
		const ANIMATION_HELPER_1 = new THREE.MMDAnimationHelper();



		animationMixer_a.clipAction( motions_a[0] ).reset();
		animationMixer_a.clipAction( motions_a[0] ).play();
		animationMixer_a.clipAction( motions_a[0] ).setLoop( THREE.LoopOnce );

		animationMixer_b.clipAction( motions_b[0] ).reset();
		animationMixer_b.clipAction( motions_b[0] ).play();
		animationMixer_b.clipAction( motions_b[0] ).setLoop( THREE.LoopOnce );
		motionIndex = 0;

	} else if ( isRecording === true ) {
		$('#save_webm').html('WebM動画録画');
		isRecording = false;
		mediaRecorder.stop();

		animationMixer_a.clipAction( motions_a[0] ).stop();
		animationMixer_b.clipAction( motions_b[0] ).stop();
		renderer.setClearAlpha(0.0);

		$('#player').show();
		player.stopVideo();
	}
	return false;
});

//***********************************************************************************************
// ライブラリー
//***********************************************************************************************

//-----------------------------------------------------------------------------------------------
// 非同期処理
//-----------------------------------------------------------------------------------------------
function sleep( second ) {
	return new Promise( function ( resolve ) {
		setTimeout( function() {
			resolve();
		}, second * 1000 );
	} );
}

resizeWindow = function (e) {
	let cw = $(window).width();;
	let ch = $(window).height();;
	let cRate = cw/ch;
	let p = 1;

	if(canvasRate>cRate){
		p = cw/canvasSizeW;// 縦長なので幅を基準に拡大縮小
	} else {
		p = ch/canvasSizeH;// 横長なので高さを基準に拡大縮小
	}
	$("#webgl").css({transformOrigin: "0 0",transform: 'scale('+p+')'});
}