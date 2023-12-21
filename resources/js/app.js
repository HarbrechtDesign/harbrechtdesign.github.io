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

// WIP Modal
//=====================================================================
$(document).ready(function(){
	var modal = $('#wip-modal'),
		closeModal = $('#wip-modal button');
	modal.addClass('open');
	closeModal.click(function(){
		modal.removeClass('open');
	})
})


// Size left col
//=====================================================================
function sizeLeftCol(e) {
	$('.col.left').width(e);
}
function unsizeLeftCol() {
	$('.col.left').width('auto');
}
$(window).on("load resize",function(e){
	var leftColSize = $('.grid-placeholder').width();
	if ($(window).width() > 979) {
		sizeLeftCol(leftColSize);
	} else {
		unsizeLeftCol();
	}
});


// Size the cards for Masonry
//=====================================================================
function sizeCards() {
	var cardHeight = 0,
		gap = 0;
	$(".card__placeholder").each(function() {
		var thisHMax = $(this).height();
		// $(this).height(thisHMax);
		cardHeight += thisHMax;
		gap += 20; // account for flex-gap of 2rem
	});
	// gap = gap - 40; // account for no gap for bottom 2 cards
	if ($(window).width() > 674) {
		$('#projects').css('max-height',(cardHeight + gap + 200) / 2);
	} else {
		$('#projects').css('max-height','unset');
	}
	// Size modals based on parent card
	//=====================================================================
	$('.card__placeholder').each(function(){
		var cardWidth = $(this).width(),
			cardHeight = $(this).height();
		$(this).find('.morph-content').css({'width':cardWidth,'height':cardHeight})
	})

	$(window).resize(function(){
		if ($(window).width() > 674) {
			$('#projects').css('max-height',(cardHeight + gap) / 2);
		} else {
			$('#projects').css('max-height','unset');
		}
	});
	
}

// Create Modals
//=====================================================================
function initModals() {
	var docElem = window.document.documentElement, didScroll, scrollPosition;

	// trick to prevent scrolling when opening/closing button
	function noScrollFn() {
		window.scrollTo( scrollPosition ? scrollPosition.x : 0, scrollPosition ? scrollPosition.y : 0 );
	}

	function noScroll() {
		window.removeEventListener( 'scroll', scrollHandler );
		window.addEventListener( 'scroll', noScrollFn );
	}

	function scrollFn() {
		window.addEventListener( 'scroll', scrollHandler );
	}

	function canScroll() {
		window.removeEventListener( 'scroll', noScrollFn );
		scrollFn();
	}

	function scrollHandler() {
		if( !didScroll ) {
			didScroll = true;
			setTimeout( function() { scrollPage(); }, 60 );
		}
	};

	function scrollPage() {
		scrollPosition = { x : window.pageXOffset || docElem.scrollLeft, y : window.pageYOffset || docElem.scrollTop };
		didScroll = false;
	};

	scrollFn();

	[].slice.call( document.querySelectorAll( '.morph-button' ) ).forEach( function( bttn ) {
		new UIMorphingButton( bttn, {
			closeEl : '.icon-close',
			onBeforeOpen : function() {
				// don't allow to scroll
				noScroll();
			},
			onAfterOpen : function() {
				// can scroll again
				noScroll();
			},
			onBeforeClose : function() {
				// don't allow to scroll
				noScroll();
			},
			onAfterClose : function() {
				// can scroll again
				canScroll();
			}
		} );
	} );
};

// Projects JSON Builder
//=====================================================================
function projectsJSON() {
	// Replace "leverdemo" with your own company name
	var url = '/js/projects.json';

	function createProjects(_data) {
		// Build listings
		var i,
			j;
		for(i = 0; i < _data.projects.length; i++) {
			var projects = _data.projects[i],
				cleanTags = $.trim(projects.tags).replaceAll(',', ', '),
				url = projects.externalUrl,
				codepenID;
			if (url.includes("codepen")) {
				let array = url.split('/');
				codepenID = array[array.length-1];
			} else {
				codepenID = '';
			}
			var cardTemplate = `
					<div class="card__placeholder morph-button">
						<div class="card">
							<div class="term-head">
								<div class="btn-wrap">
									<div class="header-btn red"></div>
									<div class="header-btn yellow"></div>
									<div class="header-btn green"></div>
								</div>
							</div>
							<header>
								<h4>${cleanTags}</h4>
							</header>
							<div class="preview_title">
								<h3>${projects.title}</h3>
								<button type="button">View</button>
							</div>
						</div>
						<div class="morph-content">
							<div class="term-head">
								<div class="btn-wrap">
									<div class="header-btn red"></div>
									<div class="header-btn yellow"></div>
									<div class="header-btn green"></div>
								</div>
							</div>
							<div class="animate-wrap">
								<span class="icon-close"></span>
								<div class="card">
									<header>
										<h4>${cleanTags}</h4>
									</header>
									<div class="content">
										<h3>${projects.title}</h3>
										${projects.body}
										<a href="${projects.externalUrl}" target="_blank" rel="noopener">View Project 
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 12 12" aria-hidden="true"><title>External link icon</title><path d="M10.976 1.193A.314.314 0 0010.687 1H6.312a.313.313 0 000 .625h3.62L5.467 6.091a.313.313 0 00.443.442l4.466-4.466v3.62a.313.313 0 00.625 0V1.313a.328.328 0 00-.024-.119z"></path><path d="M3.5 1v.625H2.25a.625.625 0 00-.625.625v7.5c0 .345.28.625.625.625h7.5c.345 0 .625-.28.625-.625V8.5H11v1.875c0 .345-.28.625-.625.625h-8.75A.625.625 0 011 10.375v-8.75C1 1.28 1.28 1 1.625 1H3.5z"></path></svg>
										</a>
										${(() => {
											if (projects.screenshot) {
												return `
													<img src="/img/${projects.screenshot}">
												`
											} else {
												return '';
											}
										})()}
										${(() => {
											if (codepenID.length > 1) {
												return `
													<p class="codepen" data-height="499" data-theme-id="dark" data-default-tab="result" data-slug-hash="${codepenID}" data-user="Charbrec" style="height: 499px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
														<span>See the Pen <a href="https://codepen.io/Charbrec/pen/vYroOmY">Youtube API Playlist Listing</a> by Cameron Harbrecht (<a href="https://codepen.io/Charbrec">@Charbrec</a>) on <a href="https://codepen.io">CodePen</a>.</span>
													</p>
													<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>
												`
											} else {
												return '';
											}
										})()}
									</div>
								</div>
							</div>
						</div>
					</div>
				`;
			$('#projects').append(cardTemplate);
		}
	}

	// $.ajax({
	// 	dataType: "json",
	// 	url: url,
	// 	success: function(data){
	// 		createProjects(data);
	// 		sizeCards();
	// 		initModals();
	// 	}
	// });
	fetch(url)
	.then((res) => res.json())
	.then((data) => {
		// do stuff with the data
		createProjects(data);
		sizeCards();
		initModals();
	});
}
projectsJSON();




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