(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.bodyScrollLock = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  // Older browsers don't support event options, feature detect it.

  // Adopted and modified solution from Bohdan Didukh (2017)
  // https://stackoverflow.com/questions/41594997/ios-10-safari-prevent-scrolling-behind-a-fixed-overlay-and-maintain-scroll-posi

  var hasPassiveEvents = false;
  if (typeof window !== 'undefined') {
    var passiveTestOptions = {
      get passive() {
        hasPassiveEvents = true;
        return undefined;
      }
    };
    window.addEventListener('testPassive', null, passiveTestOptions);
    window.removeEventListener('testPassive', null, passiveTestOptions);
  }

  var isIosDevice = typeof window !== 'undefined' && window.navigator && window.navigator.platform && (/iP(ad|hone|od)/.test(window.navigator.platform) || window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);


  var locks = [];
  var documentListenerAdded = false;
  var initialClientY = -1;
  var previousBodyOverflowSetting = void 0;
  var previousBodyPaddingRight = void 0;

  // returns true if `el` should be allowed to receive touchmove events.
  var allowTouchMove = function allowTouchMove(el) {
    return locks.some(function (lock) {
      if (lock.options.allowTouchMove && lock.options.allowTouchMove(el)) {
        return true;
      }

      return false;
    });
  };

  var preventDefault = function preventDefault(rawEvent) {
    var e = rawEvent || window.event;

    // For the case whereby consumers adds a touchmove event listener to document.
    // Recall that we do document.addEventListener('touchmove', preventDefault, { passive: false })
    // in disableBodyScroll - so if we provide this opportunity to allowTouchMove, then
    // the touchmove event on document will break.
    if (allowTouchMove(e.target)) {
      return true;
    }

    // Do not prevent if the event has more than one touch (usually meaning this is a multi touch gesture like pinch to zoom).
    if (e.touches.length > 1) return true;

    if (e.preventDefault) e.preventDefault();

    return false;
  };

  var setOverflowHidden = function setOverflowHidden(options) {
    // Setting overflow on body/documentElement synchronously in Desktop Safari slows down
    // the responsiveness for some reason. Setting within a setTimeout fixes this.
    setTimeout(function () {
      // If previousBodyPaddingRight is already set, don't set it again.
      if (previousBodyPaddingRight === undefined) {
        var _reserveScrollBarGap = !!options && options.reserveScrollBarGap === true;
        var scrollBarGap = window.innerWidth - document.documentElement.clientWidth;

        if (_reserveScrollBarGap && scrollBarGap > 0) {
          previousBodyPaddingRight = document.body.style.paddingRight;
          document.body.style.paddingRight = scrollBarGap + 'px';
        }
      }

      // If previousBodyOverflowSetting is already set, don't set it again.
      if (previousBodyOverflowSetting === undefined) {
        previousBodyOverflowSetting = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      }
    });
  };

  var restoreOverflowSetting = function restoreOverflowSetting() {
    // Setting overflow on body/documentElement synchronously in Desktop Safari slows down
    // the responsiveness for some reason. Setting within a setTimeout fixes this.
    setTimeout(function () {
      if (previousBodyPaddingRight !== undefined) {
        document.body.style.paddingRight = previousBodyPaddingRight;

        // Restore previousBodyPaddingRight to undefined so setOverflowHidden knows it
        // can be set again.
        previousBodyPaddingRight = undefined;
      }

      if (previousBodyOverflowSetting !== undefined) {
        document.body.style.overflow = previousBodyOverflowSetting;

        // Restore previousBodyOverflowSetting to undefined
        // so setOverflowHidden knows it can be set again.
        previousBodyOverflowSetting = undefined;
      }
    });
  };

  // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#Problems_and_solutions
  var isTargetElementTotallyScrolled = function isTargetElementTotallyScrolled(targetElement) {
    return targetElement ? targetElement.scrollHeight - targetElement.scrollTop <= targetElement.clientHeight : false;
  };

  var handleScroll = function handleScroll(event, targetElement) {
    var clientY = event.targetTouches[0].clientY - initialClientY;

    if (allowTouchMove(event.target)) {
      return false;
    }

    if (targetElement && targetElement.scrollTop === 0 && clientY > 0) {
      // element is at the top of its scroll.
      return preventDefault(event);
    }

    if (isTargetElementTotallyScrolled(targetElement) && clientY < 0) {
      // element is at the bottom of its scroll.
      return preventDefault(event);
    }

    event.stopPropagation();
    return true;
  };

  var disableBodyScroll = exports.disableBodyScroll = function disableBodyScroll(targetElement, options) {
    if (isIosDevice) {
      // targetElement must be provided, and disableBodyScroll must not have been
      // called on this targetElement before.
      if (!targetElement) {
        // eslint-disable-next-line no-console
        console.error('disableBodyScroll unsuccessful - targetElement must be provided when calling disableBodyScroll on IOS devices.');
        return;
      }

      if (targetElement && !locks.some(function (lock) {
        return lock.targetElement === targetElement;
      })) {
        var lock = {
          targetElement: targetElement,
          options: options || {}
        };

        locks = [].concat(_toConsumableArray(locks), [lock]);

        targetElement.ontouchstart = function (event) {
          if (event.targetTouches.length === 1) {
            // detect single touch.
            initialClientY = event.targetTouches[0].clientY;
          }
        };
        targetElement.ontouchmove = function (event) {
          if (event.targetTouches.length === 1) {
            // detect single touch.
            handleScroll(event, targetElement);
          }
        };

        if (!documentListenerAdded) {
          document.addEventListener('touchmove', preventDefault, hasPassiveEvents ? { passive: false } : undefined);
          documentListenerAdded = true;
        }
      }
    } else {
      setOverflowHidden(options);
      var _lock = {
        targetElement: targetElement,
        options: options || {}
      };

      locks = [].concat(_toConsumableArray(locks), [_lock]);
    }
  };

  var clearAllBodyScrollLocks = exports.clearAllBodyScrollLocks = function clearAllBodyScrollLocks() {
    if (isIosDevice) {
      // Clear all locks ontouchstart/ontouchmove handlers, and the references.
      locks.forEach(function (lock) {
        lock.targetElement.ontouchstart = null;
        lock.targetElement.ontouchmove = null;
      });

      if (documentListenerAdded) {
        document.removeEventListener('touchmove', preventDefault, hasPassiveEvents ? { passive: false } : undefined);
        documentListenerAdded = false;
      }

      locks = [];

      // Reset initial clientY.
      initialClientY = -1;
    } else {
      restoreOverflowSetting();
      locks = [];
    }
  };

  var enableBodyScroll = exports.enableBodyScroll = function enableBodyScroll(targetElement) {
    if (isIosDevice) {
      if (!targetElement) {
        // eslint-disable-next-line no-console
        console.error('enableBodyScroll unsuccessful - targetElement must be provided when calling enableBodyScroll on IOS devices.');
        return;
      }

      targetElement.ontouchstart = null;
      targetElement.ontouchmove = null;

      locks = locks.filter(function (lock) {
        return lock.targetElement !== targetElement;
      });

      if (documentListenerAdded && locks.length === 0) {
        document.removeEventListener('touchmove', preventDefault, hasPassiveEvents ? { passive: false } : undefined);

        documentListenerAdded = false;
      }
    } else {
      locks = locks.filter(function (lock) {
        return lock.targetElement !== targetElement;
      });
      if (!locks.length) {
        restoreOverflowSetting();
      }
    }
  };
});


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

	function thisHeight(){
		return $(this).height();
	}
	var cardHeight = 0,
		gap = 0;
	$(".card__placeholder").each(function() {
		var thisHMax = Math.max.apply(Math, $(this).map(thisHeight));
		$(this).height(thisHMax);
		cardHeight += thisHMax;
		gap += 20; // account for flex-gap of 2rem
	});
	gap = gap - 40; // account for no gap for bottom 2 cards
	if ($(window).width() > 674) {
		$('#projects').css('max-height',(cardHeight + gap) / 2);
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
				cardTemplate = `
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
							<div>
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
										<p>${projects.body}</p>
										<a href="${projects.externalUrl}">View Project 
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 12 12" aria-hidden="true"><title>External link icon</title><path d="M10.976 1.193A.314.314 0 0010.687 1H6.312a.313.313 0 000 .625h3.62L5.467 6.091a.313.313 0 00.443.442l4.466-4.466v3.62a.313.313 0 00.625 0V1.313a.328.328 0 00-.024-.119z"></path><path d="M3.5 1v.625H2.25a.625.625 0 00-.625.625v7.5c0 .345.28.625.625.625h7.5c.345 0 .625-.28.625-.625V8.5H11v1.875c0 .345-.28.625-.625.625h-8.75A.625.625 0 011 10.375v-8.75C1 1.28 1.28 1 1.625 1H3.5z"></path></svg>
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				`;
			$('#projects').append(cardTemplate);
		}
	}

	$.ajax({
		dataType: "json",
		url: url,
		success: function(data){
			createProjects(data);
			sizeCards();
			initModals();
		}
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