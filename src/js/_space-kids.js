import * as state from './state';
import gsap, { Cubic } from 'gsap';
import { areaWidth, areaHeight, imagePath } from './common';
import YouTubePlayer from 'youtube-player';

state.on('enter', () => {
	document.querySelector('main.space-kids') && (() => {
		document.querySelector('.space-kids-visual').classList.add('show');

		// visual
		(() => {
			let $main = document.querySelector('main.space-kids')

			const $visual = $main.querySelector('.space-kids-visual');
			const $children = $main.querySelectorAll('.space-kids-visual .sticky > *:not(video)');
			const $ment = $children[2];
			const $mentList = $ment.children[0].querySelectorAll('span')
			let timeline, visualHeight;


			timeline && timeline.kill();
			timeline = gsap.timeline({ paused: true });

			state.on('scroll', (scrollTop) => {
				const rect = $visual.getBoundingClientRect();
				if (rect.top < areaHeight && rect.bottom > 0) {
					const progress = -rect.top / visualHeight;
					timeline.progress(progress);

					// console.log(progress);
				}
			});

			state.on('mediachange', (media) => {
			});
			
			// createTimeline();
			state.on('resize', (areaWidth, areaHeight) => {
				visualHeight = $visual.offsetHeight - areaHeight;
			});
			createTimeline();
			
			function createTimeline () {
				timeline.fromTo($children[1], { opacity: 1, y: 0}, { opacity: 0, y: -30, duration: 7, ease: 'power3.out' },2.5);
				timeline.fromTo($children[2], { opacity: 0, y: 0}, { opacity: 1, duration: 4, ease: 'power3.out' }, 3.2);
				timeline.fromTo($children[2].children[0], { opacity: 0, }, { opacity: 1, duration: 5, ease: 'power3.out' }, 7);

				$mentList.forEach(($highlight, index) => {
					if (index > 0) {
						timeline.to($highlight, { opacity: 1, duration: 5, ease: 'power2.inOut' }, '-=1');
					}
					if (index !== $mentList.length - 1 ) {
						timeline.to($highlight, { opacity: 0.2, duration: 5, delay: index > 0 ? 0.1 : 0.5, ease: 'power2.inOut' });
					}
				});
			}
		})();
		
		// benefit
		(() => {
			let $main = document.querySelector('main.space-kids')
			let $benefit = $main.querySelector('.benefit')
			let $benefitListItems = $benefit.querySelectorAll('.list-item .list-eyebrow, .list-item strong')
			let timeline, benefitHeight;

			timeline && timeline.kill();
			timeline = gsap.timeline({ paused: true });

			state.on('scroll', (scrollTop) => {
				const rect = $benefit.getBoundingClientRect();
				if (rect.top < areaHeight && rect.bottom > 0) {
					// const progress = (rect.top)  / (benefitHeight);
					const moveArea = scrollTop - areaHeight
					const progress = Math.min(1, Math.max(0, (-rect.top + (areaHeight/2)) / $benefit.offsetHeight));
					timeline.progress(progress);
				}
			});

			state.on('mediachange', (media) => {
			});
			
			state.on('resize', (areaWidth, areaHeight) => {
				benefitHeight = $benefit.offsetHeight - areaHeight;
			});
			createTimeline();
			
			function createTimeline () {
				for (let i = 0; i < $benefitListItems.length; i++) {
					timeline.fromTo($benefitListItems[i], { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'cubic.out', 
					onComplete: () => { 
						$benefitListItems[i].parentNode.classList.add('show')
          }}, i % 2 === 0 ? null : '-=0.5');
				}
			}
		})();

		// youtube player
		(() => {
			let $main = document.querySelector('main.space-kids');
			let $youtube = $main.querySelectorAll('[data-youtubeid]');
			const _on_event = function(event){
				console.log(this)
				if(event.data==1) this && this.classList.add("playing");
				else this && this.classList.remove("playing");
			};

			$youtube.forEach((el) => {
				let _el_wrap = el.closest(".video-container") || el.parentNode;
				_el_wrap.player = YouTubePlayer(el, {
					videoId: el.dataset.youtubeid
				});
				_el_wrap.player.on('stateChange', _on_event.bind(_el_wrap));
				_el_wrap.playbtn = _el_wrap.querySelector(".control-play");
				_el_wrap.playbtn.onclick = () => {
					_el_wrap.player.playVideo().then(function () {});
				};
			});
		})();

		// section
		let viewRatio
		(() => {
			let $main = document.querySelector('main.space-kids')
			let $section = $main.querySelectorAll('section .contents-list')

			let observer = new IntersectionObserver( function (entries, observer) {
				entries.forEach((entry) => {
					if(entry.intersectionRatio > viewRatio){
						entry.target.parentNode.classList.add('show')
					}else{
						// entry.target.classList.remove('show')
					}
				});
			}, {
				root: null,
				rootMargin: "0% 0% 0%",
				threshold: [0, 0.2, 0.4, 0.6, 1]
			});
			
			$section.forEach((el) => {
				observer.observe(el);
			})
		})();
		
		state.on('resize', () => {
			viewRatio = (areaWidth > 767) ? 0.4 : 0
		});

		state.on('leave', () => {
			console.log('_space-kids.js leave');
		});
	})();
});