import * as state from './state';
import { areaWidth, areaHeight } from './common';


state.on('enter', () => {
	document.querySelector('main.space-kids-mediaroom') && (() => {
		document.querySelector('main.space-kids-mediaroom').classList.add('show')

		const $main = document.querySelector('.space-kids-mediaroom')
		const $listSec = $main.querySelector('.content-list-wrapper')
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

				window.scrollTo({ top: 0});
			})
		})

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
				let tumbImg = thumbnail.querySelector('.img-wrap')
				thumbnail.addEventListener('mousemove', event => {
					tilt(event, tumbImg);
				});
				thumbnail.addEventListener('mouseleave', () => {
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

		if (state.states.media !== 'mobile') tiltEffect()

		const observerOptions = {
            rootMargin: "100px 0px 0px 0px",
            threshold: 0
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('on');
                }
            });
        }, observerOptions);

        $listItem.forEach(el => observer.observe(el));

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
			spaceHeight = $spaceBg.offsetHeight - areaHeight;

			if (state.states.media !== 'mobile') tiltEffect()
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