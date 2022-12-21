//┌──────────────────────────────────────
//│  ファンクションライブラリ
//└──────────────────────────────────────
//==============================================================================
var vector3 = new THREE.Vector3();
var baseVector3 = new THREE.Vector3();
var baseVector2 = new THREE.Vector2();
// MMD 3Dモデルのモーションに関連する変数
var ANIMATION_HELPER = new THREE.MMDAnimationHelper();
var CLOCK = new THREE.Clock();

$(function () {
	$('#morph_open').on('click',function(){
		$('#morph').fadeIn();
		return false;
	});
	$('#morph .modal_close').on('click',function(){
		$('#morph').fadeOut();
		return false;
	});

	$('#motion_open').on('click',function(){
		$('#motion').fadeIn();
		return false;
	});
	$('#motion .modal_close').on('click',function(){
		$('#motion').fadeOut();
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

	if(blink_on)$('#blink_on').prop('checked', true);
	$('#blink_on').change(function() {
		if ($(this).prop('checked')) blink_on = true;
		else blink_on = false;
	});

	if(physics_on)$('#physics_on').prop('checked', true);
	$('#physics_on').change(function() {
		if ($(this).prop('checked')) physics_on = true;
		else physics_on = false;
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




//***********************************************************************************************
// メインプログラム
//***********************************************************************************************
// DOMの解析が終わったらメインプログラムを実行
document.addEventListener( 'DOMContentLoaded', function () {
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
}, false );

//-----------------------------------------------------------------------------------------------
// (1)シーンの準備
//-----------------------------------------------------------------------------------------------
function prepareScene() {
	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
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
		PMX_FILE.file,
		function ( mmd ) {
			mesh = mmd;
			// オブジェクトで管理しているMMD 3Dモデルのファイル(PMXファイル)の放出度および輪郭線の太さのプロパティーを使用
			for ( let i = 0; i < mesh.material.length; i ++ ) {
				mesh.material[ i ].emissive.multiplyScalar( PMX_FILE.emissive );
				mesh.material[ i ].userData.outlineParameters.thickness = PMX_FILE.thickness;
			}
			// オブジェクトで管理しているMMD 3Dモデルのファイル(PMXファイル)のセルフシャドウ(receiveShadow)のプロパティーを使用
			mesh.castShadow = true;
			if ( PMX_FILE.receiveShadow ) {
				mesh.receiveShadow = true;
			} else {
				mesh.receiveShadow = false;
			}
			// オブジェクトで管理しているMMD 3Dモデルのファイル(PMXファイル)の倍率のプロパティーを使用
			mesh.scale.copy( new THREE.Vector3( 1, 1, 1 ).multiplyScalar( PMX_FILE.multiply ) );
			const BOUNDING_BOX = new THREE.Box3().setFromObject( mesh );
			vector3.setY( 0.5 * BOUNDING_BOX.max.y );
			light.target.position.copy( new THREE.Vector3( 0, 0.5 * BOUNDING_BOX.max.y, 0 ) );
			// モーションファイル(VMDファイル)を読み込んで、AnimationClip(配列で管理する)を作成
			for ( let i = 0; i < VMD_FILES.length; i ++ ) {
				LOADER_2.loadAnimation( VMD_FILES[ i ].file, mesh, function ( motion ) {
					// モーションファイルはAnimationClipとして読み込まれる、配列に保存
					motions[ i ] = motion;
					// AnimationClipのnameプロパティーの設定
					motions[ i ].name = VMD_FILES[ i ].name;
				} );
			}
			// オブジェクトで管理しているMMD 3Dモデルのファイル(PMXファイル)の物理演算のプロパティーを使用 物理演算あり(true) / 物理演算なし(false) 
			if ( PMX_FILE.physics ) {
				// (Constructor) MMDAnimationHelper( params : Object )
				// (Method) .add ( object : Object3D, params : Object ) : MMDAnimationHelper
				ANIMATION_HELPER.add( mesh, { animation: motions, physics: true } );
			} else {
				ANIMATION_HELPER.add( mesh, { animation: motions, physics: false } );
			}
			// 再生、停止、一時停止を制御するための AnimationMixer を取得
			// (Property) .objects : WeakMap
			animationMixer = ANIMATION_HELPER.objects.get( mesh ).mixer;
			// AnimationHelperにより開始したモーションを停止する
			// (Method) .stopAllAction () : AnimationMixer
			animationMixer.stopAllAction();
			scene.add( mesh );

			//------------------------------------------------------------------
			let htmlSource = '';

			// ポーズ
			for ( let i = 0; i < VPD_FILES.length; i ++ ) {
				htmlSource += '<li><a id="pose' + i + '" ';
				htmlSource += 'href="javascript:/* ' + VPD_FILES[i].name + ' */" ';
				htmlSource += 'rel="' + i + '"'
				htmlSource += '>'
				htmlSource += VPD_FILES[i].name + ' ( ' + i + ' )';
				htmlSource += '</a></li>'
			}

			// 最後にまとめてinnerHTMLに渡す
			$('#pose ul').html(htmlSource);

			// 追加したボタンにイベントを登録
			$('#pose li a').each(function(index) {

				let rel = $(this).attr("rel");
				(function() {
					$("#pose"+rel).on('click', function(){
						// VPDファイルを読込ためのMMDLoader
						//const LOADER_1 = new THREE.MMDLoader();
						// ポーズ用のMMDAnimationHelperオブジェクト
						//const ANIMATION_HELPER_1 = new THREE.MMDAnimationHelper();
						if ( poseIndex === -1 ) {
							// モーションを停止する
							animationMixer.stopAllAction();
							// ポーズの開始
							// VPDファイルの読込
							// loadVPD( url : String, isUnicode : Boolean,	onLoad : Function, onProgress : Function, onError : Function ) : Object
							//LOADER_1.loadVPD( VPD_FILES[rel].file, false, function ( pose ) {
							//	// (Method) .pose ( mesh : SkinnedMesh, vpd : Object, params : Object ) : MMDAnimationHelper
							//	ANIMATION_HELPER_1.pose( mesh, pose, { resetPose: false, ik: true, grant: true } );
							//} );
							LOADER_2.loadVPD( VPD_FILES[rel].file, false, function ( pose ) {
								// (Method) .pose ( mesh : SkinnedMesh, vpd : Object, params : Object ) : MMDAnimationHelper
								ANIMATION_HELPER.pose( mesh, pose, { resetPose: true, ik: true, grant: true } );
							} );
							motionIndex = -1;
							poseIndex = rel;
						} else if ( poseIndex === rel ) {
							// ポーズの停止(リセット)
							mesh.pose();
							poseIndex = -1;
						} else {
							// ポーズを停止して、他のポーズの開始
							//LOADER_1.loadVPD( VPD_FILES[rel].file, false, function ( pose ) {
							//	ANIMATION_HELPER_1.pose( mesh, pose, { resetPose: false } );
							//} );
							LOADER_2.loadVPD( VPD_FILES[rel].file, false, function ( pose ) {
								ANIMATION_HELPER.pose( mesh, pose, { resetPose: true } );
							} );
							motionIndex = -1;
							poseIndex = rel;
						}
						$('#pose').fadeOut();


					});
				})();
			});

			//------------------------------------------------------------------
			htmlSource = '';

			// モーション
			for ( let i = 0; i < VMD_FILES.length; i ++ ) {
				htmlSource += '<li><a id="motion' + i + '" ';
				htmlSource += 'href="javascript:/* ' + VMD_FILES[i].name + ' */" ';
				htmlSource += 'rel="' + i + '"'
				htmlSource += '>'
				htmlSource += VMD_FILES[i].name + ' ( ' + i + ' )';
				htmlSource += '</a></li>'
			}

			// 最後にまとめてinnerHTMLに渡す
			$('#motion ul').html(htmlSource);

			// 追加したボタンにイベントを登録
			$('#motion li a').each(function(index) {

				let rel = $(this).attr("rel");
				(function() {
					$("#motion"+rel).on('click', function(){
						 // モーションの開始
						if ( motionIndex === -1 ) {
							// モーションを停止する
							animationMixer.stopAllAction();
							// (Method) .play () : AnimationAction
							animationMixer.clipAction( motions[rel] ).play();
							// (Method) .setLoop ( loopMode : Number, repetitions : Number ) : AnimationAction
							animationMixer.clipAction( motions[rel] ).setLoop( THREE.LoopOnce );
							motionIndex = rel;
							poseIndex = -1;
						} else if ( motionIndex === rel && animationMixer.clipAction( motions[rel] ).paused === false ) {
							// モーションの一時停止
							// (Property) .paused : Boolean
							animationMixer.clipAction( motions[rel] ).paused = true;
						} else if ( motionIndex === rel && animationMixer.clipAction( motions[rel] ).paused === true ) {
							// モーションの一時停止から再開
							animationMixer.clipAction( motions[rel] ).paused = false;
						} else {
							// モーションを停止して、他のモーションの開始
							// (Method) .stop () : AnimationAction
							animationMixer.clipAction( motions[ motionIndex ] ).stop();
							animationMixer.clipAction( motions[rel] ).play();
							animationMixer.clipAction( motions[rel] ).setLoop( THREE.LoopOnce );
							motionIndex = rel;
							poseIndex = -1;
						}
						$('#motion').fadeOut();
					});
				})();
			});

			//------------------------------------------------------------------
			// morphTargetDictionary 内の KEY 数をカウント
			let count = 0;
			// innerHTMLはHTMLを都度解釈するため、タグが補完されてしまうので、タグが補完されないよう一度変数に入れ、最後にまとめてinnerHTMLに渡す
			htmlSource = '';

			// メッシュ内のMorph Target Dictionaryに登録されているMorph（表情）を取得、ボタンにする
			// morphTargetDictionaryのキーがMorph Target Name、値がmorphTargetInfluences配列のインデックス
			// (Property) .morphTargetDictionary : Object
			for ( const KEY in mesh.morphTargetDictionary ) {
				// ボタンを追加
				htmlSource += '<li><a id="morph' + mesh.morphTargetDictionary[ KEY ] + '" ';
				htmlSource += 'href="javascript:/* ' + KEY + ' */" ';
				htmlSource += 'rel="' + mesh.morphTargetDictionary[ KEY ] + '"'
				htmlSource += '>'
				htmlSource += KEY + ' ( ' + mesh.morphTargetDictionary[ KEY ] + ' )';
				htmlSource += '</a></li>'

				// カウントを加算
				count ++;
			}

			// 最後にまとめてinnerHTMLに渡す
			$('#morph ul').html(htmlSource);

			var premorph = 0;
			// 追加したボタンにイベントを登録
			$('#morph li a').each(function(index) {
				let rel = $(this).attr("rel");
				(function() {
					$("#morph"+rel).on('click', function(){
						// morphTargetInfluencesの値を指定することで、Morph（表情）をつける
						// (Property) .morphTargetInfluences : Array
						mesh.morphTargetInfluences[ premorph ] = 0;// 前回のMorph（表情）を戻す
						mesh.morphTargetInfluences[rel] = 1;
						premorph = rel;// Morph（表情）を保存
						$('#morph').fadeOut();
					});
				})();
			});

			//------------------------------------------------------------------
			// ランダムまばたき開始
			blink(mesh, mabatakiIndex);



			// サイズを表示
			$("header>p").html("(WxH:"+canvasSizeW+"x"+canvasSizeH+")");

		}
	);
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
	if(blink_on){
		mesh.morphTargetInfluences[idx] = 1;// まばたき
		await sleep(0.05);
		mesh.morphTargetInfluences[idx] = 0;
	}
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
	vector12.add( vector3 );
	vector14 = new THREE.Vector3( Math.cos( phiRadian - Math.PI / 2 ), 0, Math.sin( phiRadian - Math.PI / 2 ) ).multiplyScalar( pupillaryDistance1 );
	vector14.add( vector3 );
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
	if ( motionIndex === 0 && animationMixer.clipAction( motions[0] ).paused === false ) {
		// モーションの一時停止
		// (Property) .paused : Boolean
		animationMixer.clipAction( motions[0] ).paused = true;
	} else if ( motionIndex === 0 && animationMixer.clipAction( motions[0] ).paused === true ) {
		// モーションの一時停止から再開
		animationMixer.clipAction( motions[0] ).paused = false;
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
	baseVector3 = vector3.clone();
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
			vector3.x = baseVector3.x - radius * ( 0.709 / this.clientWidth ) * Math.sin( phiRadian ) * ( event.clientX - baseX );
			vector3.y = baseVector3.y + radius * ( 0.709 / this.clientWidth ) * ( event.clientY - baseY );
			vector3.z = baseVector3.z + radius * ( 0.709 / this.clientWidth ) * Math.cos( phiRadian ) * ( event.clientX - baseX );
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
		baseVector3 = vector3.clone();
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
		vector3.x = baseVector3.x - radius * ( 0.709 / this.clientWidth ) * Math.sin( phiRadian ) * ( x1 - baseX );
		vector3.y = baseVector3.y + radius * ( 0.709 / this.clientWidth ) * ( y1 - baseY );
		vector3.z = baseVector3.z + radius * ( 0.709 / this.clientWidth ) * Math.cos( phiRadian ) * ( x1 - baseX );
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
	renderer.domElement.getContext( 'webgl2', { antialias: true, preserveDrawingBuffer: false } );

	return false;
});

//-----------------------------------------------------------------------------------------------
// イベント WebM動画保存ボタン
//-----------------------------------------------------------------------------------------------
$('#save_webm').on('click',function(){
	if ( isRecording === false ) {
		$('#save_webm').html('録画停止');
		isRecording = true;
		renderer.setClearAlpha(1.0);
		const MEDIA_STREAM = renderer.domElement.captureStream( 24 );

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


		mediaRecorder.start();
		window.setTimeout( function() {
			if ( isRecording === true ) {
				$('#save_webm').html('WebM動画録画');
				isRecording = false;
				mediaRecorder.stop();

				animationMixer.clipAction( motions[motionIndex] ).stop();
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


	} else if ( isRecording === true ) {
		$('#save_webm').html('WebM動画録画');
		isRecording = false;
		animationMixer.clipAction( motions[motionIndex] ).stop();
		renderer.setClearAlpha(0.0);
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
