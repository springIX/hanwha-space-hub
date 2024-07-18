import * as state from './state';
import { areaWidth, areaHeight } from './common';


state.on('enter', () => {
	document.querySelector('main.media-room') && (() => {
		document.querySelector('main.media-room').classList.add('show')

		const $main = document.querySelector('.media-room')
		const $listSec = $main.querySelector('.contens-list')
		const $listwraps = $main.querySelectorAll('.list-wrap')
		const $spaceHubCategory = $main.querySelectorAll('.list-wrap[data-filter="Space Hub TV"] .category')
		const $listItem = $main.querySelectorAll('.list-item')
		const $listTabs = $main.querySelectorAll('.list-tabs button')
		const $spaceBg = $main.querySelector('.space-bg')
		let backPath = sessionStorage.getItem('backPath')
		let spaceHeight
		
		$spaceHubCategory.forEach((item, i) =>{
			item.innerHTML = '<span>Space Hub</span> TV'
		})

		// oberserver
		const config = { attributes: false, childList: true, subtree: false };
		const callback = (mutationList, observer) => {
			for (const mutation of mutationList) {
				if (mutation.type === "childList") {
					console.log("자식 추가 또는 제거");

					// 추가된 li 에 numbering class가 없을 경우
					mutationList[0].addedNodes.forEach(item => {
						const index = [...mutation.target.children].indexOf(item);
						if ((index + 1) % 4 === 1) {
							item.classList.add("first-item");
						} else if ((index + 1) % 4 === 2) {
							item.classList.add("second-item");
						} else if ((index + 1) % 4 === 3) {
							item.classList.add("third-item");
						} else {
							item.classList.add("fourth-item");
						}
					});

					// resize 함수 실행 - state.on('resize', {}) 과 동일
					$listwraps.forEach((lists) => {
						let listItem = lists.querySelectorAll('.list-item')
						listItem.forEach((item, index) => {
							let y = item.getBoundingClientRect().height/4
							item.style.transform = `translate3d(0, ${y}px, 0)`
						});
					});

					parallax()
					if (state.states.media !== 'mobile') tiltEffect()
					
					spaceHeight = $spaceBg.offsetHeight - areaHeight;
				}
			}
		};
		const mutationObserver = new MutationObserver(callback);
		
		// list index sort
		$listwraps.forEach((lists) => {
			let listItem = lists.querySelectorAll('.list-item')
			listItem.forEach((item, index) => {
				if ((index + 1) % 4 === 1) {
					item.classList.add("first-item");
				} else if ((index + 1) % 4 === 2) {
					item.classList.add("second-item");
				} else if ((index + 1) % 4 === 3) {
					item.classList.add("third-item");
				} else {
					item.classList.add("fourth-item");
				}
			});

			mutationObserver.observe(lists, config);
		});

		// tab click
		$listTabs.forEach( tab =>{
			tab.addEventListener('click',function(e){
				let select = tab.innerText

				$listTabs.forEach((btn) => {
					btn.classList.remove('active');
				});

				$listItem.forEach((list) => {
					list.classList.remove('show');
				});

				e.target.classList.add('active')

				$listwraps.forEach((btn) => {
					btn.classList.remove('active');
				});

				$main.querySelector('.list-wrap[data-filter="'+select+'"]').classList.add('active')
				parallax()

				window.scrollTo({ top: 0});
			})
		})
		
		// parallax
		let prevRatio = 0;
		let parallaxArea

		let listInObserver = new IntersectionObserver( function (entries, observer) {
			entries.forEach((entry) => {
				if (entry.intersectionRatio >= 1){
					entry.target.classList.add('show')
				}else{
					entry.target.classList.remove('show')
				}
				
				parallaxArea = (areaWidth > 767) ? entry.boundingClientRect.height : entry.boundingClientRect.height/2;

				if(entry.boundingClientRect.top > areaHeight/2){
					if (entry.intersectionRatio > prevRatio) {
						entry.target.style.transform = `translate3d(0, ${ (parallaxArea/4 - ((entry.intersectionRatio) * parallaxArea/4)) }px, 0)`
					} else {
						entry.target.style.transform = `translate3d(0, ${ (parallaxArea/4 - ((entry.intersectionRatio) * parallaxArea/4)) }px, 0)`
					}
				}else{
					if (entry.intersectionRatio > prevRatio) {
						entry.target.style.transform = `translate3d(0, ${parallaxArea/7-(entry.intersectionRatio * parallaxArea/7)}px, 0)`
					} else {
						entry.target.style.transform = `translate3d(0, ${parallaxArea/7-(entry.intersectionRatio * parallaxArea/7)}px, 0)`
					}
				}

				prevRatio = entry.intersectionRatio;
			});
		}, {
			root: null,
			rootMargin: "-50% 0% 0%",
			threshold: buildThresholdList()
		});

		let listOutObserver = new IntersectionObserver( function (entries) {
			entries.forEach((entry) => {
				parallaxArea = (areaWidth > 767) ? entry.boundingClientRect.height : entry.boundingClientRect.height/2;

				if(entry.boundingClientRect.top < 0){
					if (entry.intersectionRatio > prevRatio) {
						entry.target.style.transform = `translate3d(0, ${ ((parallaxArea/7) - ((1 - entry.intersectionRatio) * parallaxArea/4))}px, 0)`
					} else {
						entry.target.style.transform = `translate3d(0, ${ ((parallaxArea/7) - ((1 - entry.intersectionRatio) * parallaxArea/4))}px, 0)`
					}
				}

				prevRatio = entry.intersectionRatio;
			});
		}, {
			root: null,
			rootMargin: "0% 0% -50%",
			threshold: buildThresholdList()
		});

		function buildThresholdList() {
			let thresholds = [];
			let numSteps = 400;

			for (let i=1.0; i<=numSteps; i++) {
				let ratio = i/numSteps;
				thresholds.push(ratio);
			}
			thresholds.push(0);
			return thresholds;
		}

		function parallax() {
			document.querySelectorAll('.list-wrap:not(.active) .list-item').forEach((list) => {
				listInObserver.unobserve(list);
				listOutObserver.unobserve(list);
			});

			document.querySelectorAll('.list-wrap.active > .list-item').forEach((el) => {
				listInObserver.observe(el);
				listOutObserver.observe(el);
			})
		}

		parallax()

		// detail page to list page
		if (backPath != '' && backPath != null){
			$listTabs.forEach( tab =>{
				tab.classList.remove('active');
				if(tab.innerText == backPath) tab.click()
			})

			sessionStorage.removeItem('backPath');
		}

		function mobileHashIn (){
			let hashPath = (window.location.hash).replace('#','')
			let $html = document.querySelector('html')

			if (hashPath != '' && hashPath != null){
				$listTabs.forEach( tab =>{
					tab.classList.remove('active');
					if(tab.getAttribute('id') == hashPath) tab.click()
				})
			}

			if($html.classList.contains('mobile-menu-open')){
				$html.classList.remove('mobile-menu-open')
			}
		}
		
		mobileHashIn()
		window.addEventListener('hashchange', mobileHashIn)

		function tiltEffect(){
			const thumbnails = document.querySelectorAll('.list-item a');
			thumbnails.forEach(thumbnail => {
				let tumbImg = thumbnail.querySelector('img')
				thumbnail.querySelector('.img-wrap').addEventListener('mousemove', event => {
					tilt(event, tumbImg);
				});
				thumbnail.querySelector('.img-wrap').addEventListener('mouseleave', () => {
					tumbImg.style.transform = 'rotateX(0) rotateY(0)';
				});
			});
	
			function tilt(event, element) {
				const rect = element.getBoundingClientRect();
				const figureWidth = element.offsetWidth;
				const figureHeight = element.offsetHeight;
				const rotateAngle = Math.min(20, 9 * (200 / figureWidth));
				const x = event.clientX - rect.left;
				const y = event.clientY - rect.top;
				const rotateX = -rotateAngle * ((y - figureHeight / 2) / (figureHeight / 2));
				const rotateY = rotateAngle * ((x - figureWidth / 2) / (figureWidth / 2));
				const depth = figureWidth/15;
				const scale = 1 - Math.abs(x - figureWidth / 2) / figureWidth * 0.03 - Math.abs(y - figureHeight / 2) / figureHeight * 0.03;
				const translateX = Math.abs(x - figureWidth / 2) / figureWidth * 20 * (x < figureWidth / 2 ? -1 : 1);
				const translateY = Math.abs(y - figureHeight / 2) / figureHeight * 20 * (y < figureHeight / 2 ? -1 : 1);
				element.style.transform = `perspective(${figureWidth*2}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale}) translateZ(${depth}px) translate(${translateX}px, ${translateY}px)`;
			}
		}

		state.on('scroll', (scrollTop) => {
			const rect = $main.getBoundingClientRect();
			if (rect.top < areaHeight && rect.bottom > 0 && areaWidth > 767) {
				const progress = -rect.top / rect.height;
				// console.log(progress);
				$spaceBg.setAttribute('style','background-position: 0px -'+ (progress * spaceHeight )+'px')
			}else if(areaWidth < 768){
				$spaceBg.removeAttribute('style')
			}
		});

		state.on('resize', (areaWidth, areaHeight) => {
			$listwraps.forEach((lists) => {
				let listItem = lists.querySelectorAll('.list-item')
				listItem.forEach((item, index) => {
					let y = item.getBoundingClientRect().height/4
					item.style.transform = `translate3d(0, ${y}px, 0)`
				});
			});

			parallax()
			if (state.states.media !== 'mobile') tiltEffect()
			
			spaceHeight = $spaceBg.offsetHeight - areaHeight;
			// console.log($main.offsetHeight, spaceHeight);
		});

		state.on('leave', () => {
			console.log('_media-room.js leave');
		});
	})();

	document.querySelector('main.media-room-detail') && (() => {
		console.log('_media-room-detail.js enter');
		const $listBtn = document.querySelector('.list-btn')

		$listBtn.addEventListener('click',()=>{
			let history = (location.pathname.indexOf('press-release') > -1) ? "Press Release" : (location.pathname.indexOf('news') > -1) ? "News" : "PR Archive";
			sessionStorage.setItem('backPath', history);
		})

		state.on('leave', () => {
			console.log('_media-room-detail.js leave');
		});
	})();
});