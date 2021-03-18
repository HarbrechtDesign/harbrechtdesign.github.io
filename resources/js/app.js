// VH Hack for mobile web browsers -- making 100vh the same everywhere
//=====================================================================
function setVH() {
	// First we get the viewport height and we multiple it by 1% to get a value for a vh unit
	vh = window.innerHeight * 0.01;
	// Then we set the value in the --vh custom property to the root of the document
	$("body").get(0).style.setProperty("--vh", vh+'px');

	/* Usage:
		height: calc(var(--vh, 1vh) * 100);
	*/
}

// Size left col
//=====================================================================
function sizeLeftCol() {
	var leftColSize = $('.grid-placeholder').width();
	$('.col.left').width(leftColSize);
}
$(window).on("load resize",function(e){
	sizeLeftCol();
});

// Size the cards for Masonry
//=====================================================================
function thisHeight(){
	return $(this).height();
}
var cardHeight = 0;
$(".card__placeholder").each(function() {
	var thisHMax = Math.max.apply(Math, $(this).map(thisHeight));
	$(this).height(thisHMax);
	cardHeight += thisHMax;
});
$('#projects').css('max-height',cardHeight/1.6);

// Size modals based on parent card
//=====================================================================
$('.card__placeholder').each(function(){
	var cardWidth = $(this).width(),
		cardHeight = $(this).height();
	$(this).find('.morph-content').css({'width':cardWidth,'height':cardHeight})
})


// Modal card handling
//=====================================================================
// function cardModal() {
// 	// Set our animation timing for JS & CSS
// 	var modalTiming = 200;
// 	$("body").get(0).style.setProperty("--modalTiming", modalTiming+'ms');

	
// 	function openModal(thisObj) {
// 		var windowHeight = $(window).height(),
// 			windowWidth = $(window).width(),
// 			card = thisObj.parents('.card'),
// 			cardOffset = card.offset(),
// 			cardWidth = thisObj.parents('.card__placeholder').width(),
// 			cardHeight = thisObj.parents('.card__placeholder').height(),
// 			centerTop = (windowHeight - cardHeight) / 2,
// 			centerLeft = (windowWidth - cardWidth) / 2;

// 		function makeMovable() {
// 			card.css({
// 				'position':'fixed',
// 				'left':cardOffset.left,
// 				'top':cardOffset.top,
// 				'width':cardWidth,
// 				'z-index':'999'
// 			});
// 		}
// 		function moveIt() {
// 			cardWidth = thisObj.parents('.card__placeholder').width();
// 			cardHeight = thisObj.parents('.card__placeholder').height();
// 			centerTop = (windowHeight - cardHeight) / 2;
// 			centerLeft = (windowWidth - cardWidth) / 2;
// 			card.addClass('open').css({
// 				'left':centerLeft,
// 				'top':centerTop,
// 				'width':'auto',
// 				'max-width':'800px'
// 			});
// 		}
// 		function anchorIt() {
// 			card.addClass('open').css({
// 				'left':'50%',
// 				'top':'50%',
// 				'transform':'translate(-50%,-50%)',
// 				'transition':'none'
// 			});
// 		}
// 		// trigger our overlay
// 		$('body').toggleClass('modal-open');
// 		// position element in place but fixed so we can move it
// 		makeMovable(card);
// 		// Wait a damn second, then move 'er
// 		setTimeout(function(){
// 			moveIt();
// 			setTimeout(function(){
// 				anchorIt();
// 			}, 1000);
// 		}, 1);
// 	}
// 	function closeModal(thisObj) {
// 		// tbd
// 	}
// 	$('.learn-more').click(function() {
// 		openModal($(this));
// 	});
// 	function keyPress (e) {
// 		if(e.key === "Escape") {
// 			closeModal($(this));
// 		}
// 	}
// }
// $(document).ready(function(){
// 	cardModal();
// })