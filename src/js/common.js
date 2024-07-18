import Pace from 'pace-js';
import gsap from 'gsap';

import * as state from './state';
import { splitLetters, getCountDown, removeNode, addZero, reflowTrick, isMobile, isSafari, isFirefox } from './util';

gsap.config({
	units: { 'strokeDashArray': '' },
	units: { 'strokeDashoffset': '' },
	force3D: true
});

export let areaWidth = window.innerWidth;
export let areaHeight = window.innerHeight;

export const imagePath = '/resources/images/';

export const $html = document.documentElement;
export const $body = document.body;

const $viewportMeta = $html.querySelector('meta[name="viewport"]');
const defaultViewportContent = $viewportMeta.getAttribute('content');

export const language = $html.getAttribute('lang');

export const $header = document.querySelector('#header');
export const $footer = document.querySelector('#footer');

const $gnbLinks = [].slice.call($header.querySelectorAll('nav.gnb a, nav.util .space-kids a'));

export const $main = document.querySelector('body > main');

let $sidenav;

let scrollTop = 0, scrollHeight = 0, headerHeight = 0, contentHeight = 0;


isMobile && $html.classList.add('touch-based');

$gnbLinks.forEach(($link) => {
	$link.addEventListener('click', setGnbLinkActive);
});


// console.log('%cWe\'re your Fave.', "font-family: 'Helvetica', 'Arial', sans-serif; font-size: 1.5em; font-weight: 700; color: black;");
// console.log('https://fave.kr/');


// history management
export const historyManager = (() => {
	const $cover = document.querySelector('.page-cover');
	if (!$cover) {
		return;
	}

	const $pageTitle = document.querySelector('title');

	let urlTo,
		_pageLoaded = false,
		_displayable = true;


	// Pace.on('progress', (p) => console.log(p));
	Pace.options.restartOnPushState = false;
	Pace.options.restartOnRequestAfter = false;
	Pace.start();

	// $body.addEventListener('click', function (e) {
	// 	let $target = e.target;
	// 	while ($target !== $body) {
	// 		if ($target.nodeName.toLowerCase() === 'a') {
	// 			if ($target.target !== '_blank') {
	// 				changePage($target.getAttribute('href'));
	// 				e.preventDefault();
	// 			}
	// 			break;
	// 		}
	// 		$target = $target.parentNode;
	// 	}
	// });

	// window.addEventListener('popstate', onPoped);
	window.addEventListener('load', () => setTimeout(onPageLoadEnd, 250));
	Pace.on('done', onPageLoadEnd);


	function onPageLoadEnd (e) {
		// console.log('onPageLoadEnd')

		if (!_pageLoaded) {
			Pace.stop();
			_pageLoaded = true;
			state.dispatch('enter');
			_displayable && display();
		}
	}

	function display () {
		// console.log('display')

		state.dispatch('display');

		setCommonContents();

		state.states.media = '';

		onResize();

		unCover();
		scroller.disabled = false;
	}

	function changePage (url) {
		urlTo = url;
		history.pushState({}, '', url);
		cover();
	}

	function onPoped (e) {
		urlTo = location.pathname;
		cover();
	}

	function cover () {
		$body.appendChild($cover);
		$cover.style.opacity = 0;
		gsap.fromTo($cover, 0.3, { opacity: 0 }, { opacity: 1, ease: 'quad.out', onComplete: clear });
		scroller.disabled = true;
	}

	function unCover () {
		gsap.fromTo($cover, 0.3, { opacity: 1 }, { opacity: 0, ease: 'quad.out', onComplete: removeNode, onCompleteParams: [$cover] });
	}

	function clear () {
		$html.classList.remove('mobile-menu-open');

		removeNode($sidenav);

		setScrollTop(0);

		state.dispatch('leave');
		state.clear();

		loadPage();
	}

	function loadPage () {
		Pace.restart();
		Pace.track(function() {
			fetch(urlTo)
				.then((response) => response.text())
				.then(onLoad);
		});
	}

	function onLoad (response) {
		let pageTitle = response.match(/<title>(.+)<\/title>/);
		$pageTitle.innerHTML = pageTitle[1];

		const content = response.match(/<main +class="([^"]+)">([\s\S]+)<\/main>/);
		$main.className = content[1];
		$main.innerHTML = content[2];

		if (content[1].indexOf('space-hub') > -1) {
			setGnbLinkActive($gnbLinks[0]);
		} else if (content[1].indexOf('projectile') > -1) {
			setGnbLinkActive($gnbLinks[1]);
		} else if (content[1].indexOf('satellite') > -1) {
			setGnbLinkActive($gnbLinks[2]);
		} else if (content[1].indexOf('exploration') > -1) {
			setGnbLinkActive($gnbLinks[3]);
		} else if (content[1].indexOf('media-room') > -1) {
			setGnbLinkActive($gnbLinks[4]);
		} else if (content[1].indexOf('space-kids') > -1) {
			setGnbLinkActive($gnbLinks[5]);
		} else {
			setGnbLinkActive();
		}
	}

	return {
		set displayable (value) {
			_displayable = value;
		},
		display
	}
})();


// copy .gnb, .util from header to mobile menu
const $mobileMenu = document.querySelector('#mobile-menu');
if ($mobileMenu) {
	$mobileMenu.insertBefore(
		document.querySelector('#header > .util').cloneNode(true),
		$mobileMenu.querySelector('.language').nextSibling
	);
	const $gnbClone = document.querySelector('#header > .gnb').cloneNode(true);
	[].forEach.call($gnbClone.querySelectorAll('li a'), ($node) => {
		$node.innerHTML = '<span>' + $node.innerHTML + '</span>';
	});
	$mobileMenu.insertBefore($gnbClone, $mobileMenu.querySelector('.language').nextSibling);
}


// mobile menu tirgger
const $mobileMenuButton = document.querySelector('.mobile-menu-button');
$mobileMenuButton && $mobileMenuButton.addEventListener('click', () => {
	$html.classList.toggle('mobile-menu-open');
});


// count down mini
window.NURI_LAUNCH_SCHEDULE && (() => {
	state.on('enter', () => {
		const $numbersArray = [];

		[].forEach.call(document.querySelectorAll('[data-count-down]'), ($node) => {
			$numbersArray.push([].slice.call($node.querySelectorAll('span')));
		});

		if (!$numbersArray.length) {
			return;
		}

		const scheduleTime = new Date(NURI_LAUNCH_SCHEDULE).getTime();

		// state.on('leave', () => {
		// 	$numbersArray.length = 0;
		// });

		update();

		function update () {
			if ($numbersArray.length) {
				const numbers = getCountDown(scheduleTime);
				$numbersArray.forEach(($numbers) => {
					$numbers.forEach(($node, index) => {
						$node.innerHTML = numbers[index];
					});
				});
				gsap.delayedCall(1, update);
			}
		}
	});
})();


// network image text scale
state.on('enter', () => {
	document.querySelector('.network-texts') && (() => {
		const $networkVisualTexts = document.querySelector('.network-texts');
		const $networkVisual = $networkVisualTexts.parentNode.querySelector('video, img');
		$networkVisualTexts && state.on('resize', (areaWidth, areaHeight) => {
			const scale = Math.min(areaWidth / (state.states.media === 'mobile' ? 800 : 1280), areaHeight / 1080);
			$networkVisual.style.transform = `translate(-50%, -50%) scale(${ scale })`;
			$networkVisualTexts.style.transform = `translate(-50%, -50%) scale(${ scale })`;
			$networkVisualTexts.style.setProperty('--text-scale', Math.min(1, 1 / scale));
		});
	})();
});



// side sticky wrap
const $sideStickyWrap = document.createElement('div');
$footer && (() => {
	$sideStickyWrap.classList.add('side-sticky-wrap');
	$sideStickyWrap.innerHTML = '<div class="sticky"></div>';
	$body.insertBefore($sideStickyWrap, $footer);

	state.on('enter', () => {
		state.on('scroll', () => {
			$sideStickyWrap.style.height = contentHeight + 'px';
		});
	});
})();


// network button
const $networkButton = document.querySelector('.network-button');
$networkButton && (() => {
	$sideStickyWrap.children[0].appendChild($networkButton);

	// $networkButton.querySelector('.icon').innerHTML = new Array(6).fill(0).reduce((v) => v + '<span></span>', '');

	// const $circles = $networkButton.querySelectorAll('.icon span:nth-child(-n+3)');
	// const $dots = $networkButton.querySelectorAll('.icon span:nth-child(n+4)');

	// gsap.ticker.add(rotate);
	// // console.log($circles, $dots);

	// function rotate (time, deltaTime) {
	// 	gsap.set($circles[0], {rotationY: '+=' + deltaTime * 0.02, rotationX: '+=' + deltaTime * 0.03});
	// 	gsap.set($circles[1], {rotationY: '+=' + deltaTime * 0.07, rotationX: '+=' + deltaTime * 0.04});
	// 	gsap.set($circles[2], {rotationY: '+=' + deltaTime * 0.03, rotationX: '+=' + deltaTime * 0.08});
	// }
})();


// animate scroll
const scroller = (() => {
	const tweener = { y: 0, dy: -1, py: 0, ry: 0 };
	const isTouchMouse = [];

	let prevWheelDelta = 120,
		isWheelCaptured = false,
		_disabled = true;


	!isMobile && !isFirefox && $html.addEventListener('wheel', (e) => {
		if (_disabled) {
			e.preventDefault();
			return false;
		}

		// check touch mouse
		let _isTouchMouse = false;
		if (e.wheelDeltaY !== undefined) {
			if (e.wheelDeltaY === -3 * e.deltaY || (!isSafari && (prevWheelDelta % 120 !== 0 || Math.abs(e.wheelDeltaY) % 120 !== 0))) {
				_isTouchMouse = true;
			}
			prevWheelDelta = Math.abs(e.wheelDeltaY);
		} else if (e.wheelDelta !== undefined) {
			if (prevWheelDelta % 120 !== 0 || Math.abs(e.wheelDelta) % 120 !== 0) {
				_isTouchMouse = true;
			}
			prevWheelDelta = Math.abs(e.wheelDelta);
		}
		isTouchMouse.unshift(_isTouchMouse);
		isTouchMouse.length = 2;

		if (!isTouchMouse[0] && !isTouchMouse[1]) { // safari issue
			if (hasScrollBox(e.target)) {
				return;
			}
			if (0 > tweener.dy) {
				setTweenerValueManually(window.pageYOffset);
			}
			if (tweener.ry) {
				tweener.dy = tweener.dy - tweener.ry;
				tweener.ry = 0;
			}
			const deltaY = e.deltaY !== undefined ? e.deltaY : e.wheelDeltaY !== undefined ? e.wheelDeltaY : e.detail || e.wheelDelta * -1;
			const newScrollTop = Math.round(Math.max(0, Math.min(scrollHeight - areaHeight, tweener.dy + Math.max(-500, Math.min(500, deltaY)))));
			animate(newScrollTop);
			e.preventDefault();
		}
	}, { passive: false });

	window.addEventListener('scroll', update);
	document.body.addEventListener('click', () => {
		tweener.tween && tweener.tween.kill();
		tweener.dy = tweener.py = tweener.y;
	});


	function animate (newY) {
		if (tweener.dy !== newY) {
			const duration = Math.max(0.25, Math.min(1.25, Math.abs(newY - tweener.y) / 150));
			tweener.tween && tweener.tween.kill();
			tweener.tween = gsap.to(tweener, duration, { y: newY, ease: 'quint.out', roundProps: 'y', onUpdate: onAnimate });
			tweener.dy = newY;
		}
	}

	function onAnimate () {
		if (tweener.y !== tweener.py) {
			isWheelCaptured = true;
			tweener.y = tweener.y - tweener.ry;
			window.scrollTo(0, tweener.y);
			tweener.py = tweener.y;
		}
	}

	function setTweenerValueManually (value) {
		tweener.y = tweener.dy = value;
		tweener.ry = 0;
	}

	function hasScrollBox ($node) {
		while ($node && $node !== $body) {
			if (window.getComputedStyle($node)['overflow'].indexOf('auto') > -1) {
				return true;
			}
			$node = $node.parentNode;
		}
		return false;
	}

	function update (_scrollTop) {
		const scrollTop = typeof(_scrollTop) == 'number' ? _scrollTop : window.pageYOffset;

		tweener.ry = Math.max(tweener.ry, tweener.y - scrollTop);

		if (!isWheelCaptured) {
			tweener.tween && tweener.tween.kill();
			setTweenerValueManually(scrollTop);
		}
		isWheelCaptured = false;

		$sideStickyWrap.style.height = '';

		scrollHeight = Math.max($html.scrollHeight, $body.scrollHeight);
		headerHeight = $header.offsetHeight;
		contentHeight = scrollHeight - $footer.offsetHeight;

		state.dispatch('scroll', scrollTop, scrollHeight, contentHeight);
	}

	return {
		set disabled (value) {
			_disabled = !!value;
		},
		update: update
	};

})();


// window.addEventListener('scroll', onScroll);
window.addEventListener('resize', onResize);
requestAnimationFrame(onResize);


function setGnbLinkActive (_$target) {
	const $target = _$target && _$target.nodeName ? _$target : this;
	$gnbLinks.forEach(($link) => {
		$link.classList[$link === $target ? 'add' : 'remove']('active');
	});
}

function setCommonContents () {
	// page title motion
	const $title = document.querySelector('main:not(.main) .vision h2');
	if ($title) {
		const $letters = splitLetters($title);
		reflowTrick();
		$title.classList.add('show');
	}

	// side nav
	const $sections = [].slice.call(document.querySelectorAll('main:not(.main) > *[data-section-name]'));
	const numSections = $sections.length;
	$sidenav = numSections > 0 ? document.createElement('nav') : null;
	$sideStickyWrap.classList[$sidenav ? 'remove' : 'add']('no-side-nav');
	if ($sidenav) {
		$sidenav.className = 'side-nav';
		$sidenav.innerHTML = `
			<div class="inwrap">
				<div class="mask">
					<ul>
						${
							$sections.map(($section, index) => {
								$section.id = $section.id || 'section-content-' + index;
								return `<li>
											<a href="#${ $section.id }">
												<span>${ addZero(index + 1) }</span> 
												${ $section.dataset.sectionName }
											</a>
										</li>`;
							}).join('')
						}
					</ul>
				</div>
				<div class="progress"></div>
				<div class="total">${ addZero($sections.length) }</div>
			</div>
		`;
		$sideStickyWrap.children[0].insertBefore($sidenav, $networkButton);

		const $list = $sidenav.querySelector('ul');
		const $items = [].slice.call($list.querySelectorAll('a'));
		const itemHeight = $list.children[0].offsetHeight;

		$sidenav.style.setProperty('--mask-y-for-center', ($sidenav.children[0].offsetHeight - (itemHeight * numSections)) / 2 + 'px');
		$items.forEach(($item) => {
			$item.addEventListener('click', onSideNavClick);
		});
		// from url
		if ((/\#[a-z]+/).test(location.href)) {
			onSideNavClick.call({href: location.href}, null, 0);
			history.replaceState(null, '', location.href.split('#')[0]);
		}
		// mobile menu link
		if ($mobileMenu) {
			const regCurrentPage = new RegExp('^' + location.pathname, 'i');
			[].forEach.call($mobileMenu.querySelectorAll('ul ul a'), ($subLink) => {
				const href = $subLink.getAttribute('href');
				if (regCurrentPage.test(href)) {
					$subLink.addEventListener('click', (e) => {
						onSideNavClick.call($list.querySelector('[href*="#' + href.split('#')[1] + '"]'));
						$html.classList.remove('mobile-menu-open');
						e.preventDefault();
					});
				}
			});
		}
		// network button in space hub page
		document.querySelector('main.space-hub') && [].forEach.call(document.querySelectorAll('.network-button a, #mobile-menu .util .network a'), ($link) => {
			$link.addEventListener('click', (e) => {
				onSideNavClick.call($list.querySelector('[href*="#network"]'));
				$html.classList.remove('mobile-menu-open');
				e.preventDefault();
			});
		});

		let currentIndex = -1;
		state.on('scroll', (scrollTop) => {
			let headerColor = '',
				sidenavColor = '',
				networkButtonColor = '',
				index = 0;

			for (let i = 0; i < numSections; i++) {
				const $section = $sections[i];
				const sectionRect = $section.getBoundingClientRect();
				if (sectionRect.top < areaHeight / 2) {
					sidenavColor = $section.dataset.uiColor || 'bright';
					index = i;
				}
				if (sectionRect.top < headerHeight / 2) {
					headerColor = $section.dataset.uiColor || 'bright';
				}
				if (sectionRect.top < areaHeight - 50) {
					networkButtonColor = $section.dataset.uiColor || 'bright';
				}
				if (sectionRect.top > areaHeight) {
					break;
				}
			}

			if (!$header.classList.contains(headerColor)) {
				$header.className = 'header ' + headerColor;
			}
			if ($sidenav && !$sidenav.classList.contains(sidenavColor)) {
				$sidenav.className = 'side-nav ' + sidenavColor;
			}
			if ($networkButton && !$networkButton.classList.contains(networkButtonColor)) {
				$networkButton.className = 'network-button ' + networkButtonColor;
			}

			$sidenav.style.setProperty('--progress', Math.min(1, scrollTop / (contentHeight - areaHeight)));
			if (index !== currentIndex) {
				$items.forEach(($item, _index) => {
					$item.classList[index === _index ? 'add' : 'remove']('active');
					gsap.set($item, { y: index === _index ? 0 : index > _index ? -itemHeight * 0.7 : itemHeight * 0.7});
				});
				currentIndex = index;
			}
		});
	}

	// header 2 depth bg - space kids
	const $gnb = $header.querySelector('.gnb');
	const $gnbSpaceKids = document.querySelector('.gnb > ul > li.space-kids');

	if ( $gnbSpaceKids ) {
		$gnbSpaceKids.addEventListener('mouseover', () => {
			$gnb.classList.add('open');
		});
		$gnbSpaceKids.addEventListener('mouseout', () => {
			$gnb.classList.remove('open');
		})
	}
}

function onSideNavClick (e, duration) {
	const $target = document.getElementById(this.href.split('#')[1]);
	if ($target) {
		let offset = (state.states.media === 'mobile' ? $target.dataset.focusOffsetM : $target.dataset.focusOffset) || 0;
		if (offset) {
			offset = parseInt(offset.replace(/([0-9]+)vh/, (match, value) => parseInt(value) * areaHeight / 100));
		}
		gsap.to([$html, $body], !isNaN(duration) ? duration : 2, { scrollTop: $target.offsetTop + offset, ease: 'power3.inOut' });
	}
	e && e.stopPropagation();
	e && e.preventDefault();
}

function setScrollTop (value) {
	window.scrollTo(0, value);
}

// function onScroll () {
// 	scrollTop = window.pageYOffset;

// 	// TODO: get scrollHeight from scroller
// 	scrollHeight = Math.max($html.scrollHeight, $body.scrollHeight);
// 	contentHeight = scrollHeight - $footer.offsetHeight;

// 	state.dispatch('scroll', scrollTop, scrollHeight, contentHeight);
// }

function onResize () {
	areaWidth = $main.offsetWidth;
	areaHeight = window.innerHeight;

	if (isMobile) {
		const screenWidth = window.screen.width;
		$viewportMeta.setAttribute('content', screenWidth > 359 ? screenWidth > 767 && screenWidth < 1280 ? 'width=1280' : defaultViewportContent : 'width=360');
	}

	let media = 'desktop';
	if ($mobileMenuButton && $mobileMenuButton.offsetWidth) {
		media = $mobileMenuButton.offsetTop > 10 ? 'tablet' : 'mobile';
	}
	if (state.states.media !== media) {
		state.dispatch('mediachange', media);
	}

	$html.style.setProperty('--aw', areaWidth + 'px');
	$html.style.setProperty('--ah', areaHeight + 'px');

	state.dispatch('resize', areaWidth, areaHeight);

	scroller.update();
}


// accordion
const $accordion = document.querySelector('.accordion');
if ( $accordion ) {
	const $lis = [...$accordion.children];
	$lis.forEach($li => {
		const $content = $li.querySelector('.content');
		const $contentChild = [...$content.children];

		let contentHeight = 0;
		$contentChild.forEach($el => { contentHeight += $el.offsetHeight });
		$content.style.setProperty('--cont-height', contentHeight + 'px');

		$li.addEventListener('click', () => {
			if ( $li.classList.contains('active') ) {
				$li.classList.remove('active');
			} else {
				$li.classList.add('active');
			}
		});
	});

	state.on('resize', (areaWidth, areaHeight) => {
		$lis.forEach($li => {
			const $content = $li.querySelector('.content');
			const $contentChild = [...$content.children];
			
			contentHeight = 0;
			$contentChild.forEach($el => { contentHeight += $el.offsetHeight });
			$content.style.setProperty('--cont-height', contentHeight + 'px');
		});
	});
}



// header 2depth