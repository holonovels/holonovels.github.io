//┌──────────────────────────────────────
//│  ファンクションライブラリ
//└──────────────────────────────────────
//==============================================================================

$(function () {
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
});



