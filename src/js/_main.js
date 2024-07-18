import * as THREE from 'three';
import Swiper, { Parallax, Mousewheel, Pagination } from 'swiper';
import gsap from 'gsap';

import * as state from './state';
import { language, areaWidth, areaHeight, imagePath, historyManager } from './common';
import { createVideoNode, getCountDown, splitLetters, splitLineToBlock, removeNode, reflowTrick } from './util';


state.on('enter', () => {
	document.querySelector('main.main') && (() => {
		// historyManager.displayable = false;

		// DOM
		const $html = document.documentElement;
		const $main = $html.querySelector('.main');

		// VALUE
		let isTablet = areaWidth > 1023 ? false : true; 

		const $eltChanges = $main.querySelectorAll('.elt-c');
		const eltChanges = [];
		$eltChanges.forEach(($el, idx) => { eltChanges[idx] = { el: $el, html: $el.innerHTML }; });

    state.on('resize', (areaWidth, areaHeight) => { 
			isTablet = areaWidth > 1023 ? false : true; 
		});
		state.on('mediachange', (media) => {
			isTablet = media == 'desktop' ? false : true;

			eltChanges.forEach(obj => {
				let texts = media == 'mobile' ? 
					obj.html.split('<br class="mobile">') : 
					obj.html.split('<br class="web">');

				obj.el.innerHTML = `<span><span>${texts.join('</span></span><span><span>')}</span></span>`
			})
		});


    // visual
    (() => {
      const $section = $main.querySelector('.visual');
      const $sticky = $section.querySelector('.sticky');
      const $lens = $section.querySelector('.lens');
      const $texts = $section.querySelector('.texts');
      const $ment = $section.querySelector('.texts .ment');
      const $video = $section.querySelector('.visual video');
      const $bannerLink = $section.querySelector('.banner-link');

      let timeline, sectionHeight;

      // action
      state.on('scroll', (scrollTop) => {
        const rect = $section.getBoundingClientRect();
        if (rect.top < areaHeight && rect.bottom > 0) {
          const progress = -rect.top / sectionHeight;
          timeline && timeline.progress(progress);

          if ( !$section.classList.contains('active') ) {
            $section.classList.add('active');
            $section.querySelectorAll('.elt-t').forEach($el => {
              $el.classList.add('show');
            });
            $video.play();
          }
        } else {
          // timeline && timeline.progress(1);

          if ( $section.classList.contains('active') ) {
            $section.classList.remove('active');
            $video.pause();
          }

        }
      });
      state.on('resize', (areaWidth, areaHeight) => {
        sectionHeight = $section.offsetHeight - areaHeight;
      });

      state.on('mediachange', (media) => {
        createTimeline();
      });

      // event
      const createTimeline = function () {
        timeline && timeline.kill();
        resetNodes($section);
        timeline = gsap.timeline({ paused: true });
        timeline.fromTo($sticky, { y: 0 }, { y: -areaHeight*0.3, duration: 1, ease: 'none', }, 'seq-1');
        timeline.fromTo($texts, { y: 0, opacity: 1 }, { y: -areaHeight*0.1, opacity: 0, duration: 1, ease: 'none', }, 'seq-1');
        timeline.fromTo($bannerLink, { opacity: 1 }, { opacity: 0, duration: 1, ease: 'none', }, 'seq-1');
        timeline.fromTo($lens, { opacity: 1, scale: 1 }, { opacity: 0, scale: 1.2, duration: .5, ease: 'power2.in', }, 'seq-1');
      }
    })();


		// launch
		(() => {
			const $section = $main.querySelector('.launch');
			const $bg = $section.querySelector('.bg');
			const $inwrap = $section.querySelector('.inwrap');
			const $texts = $section.querySelector('.texts');
			const $text = $section.querySelector('.text');
			const $btn = $section.querySelector('.btn-hud');

			let timeline, sectionHeight;

			// action
			state.on('scroll', (scrollTop) => {
				const rect = $section.getBoundingClientRect();
				if (rect.top < areaHeight && rect.bottom > 0) {
					// const progress = -(rect.top - areaHeight*0.6) / areaHeight;
					const progress = -(rect.top - areaHeight*0.4) / (areaHeight + areaHeight*0.4);
					timeline && timeline.progress(progress);

          if ( !isTablet ) {
						$texts.style.transform = `translate3d(0, ${progress*-120}px, 0)`;
						$bg.style.transform = `translate3d(0, ${progress*-400}px, 0)`;
					} else {
						// $bg.style.transform = `translate3d(0, ${progress*-200}px, 0)`;
					}
				}
			});
			state.on('resize', (areaWidth, areaHeight) => {
				sectionHeight = $section.offsetHeight;
			});

			state.on('mediachange', (media) => {
				createTimeline();
				
				if ( media !== 'desktop' ) {
					$texts.style.transform = '';
					$bg.style.transform = '';
				}
			});

			// event
			const createTimeline = function () {
				timeline && timeline.kill();
				resetNodes($section);
				timeline = gsap.timeline({ paused: true });

				const $elts = $section.querySelectorAll('.elt-s span span');
				const eltsLength = $elts.length;
				// timeline.fromTo($bg, { y: 200 }, { y: 0, duration: 1, ease: 'cubic.out' }, 'seq-1');
				$elts.forEach(($elt, index) => {
					timeline.fromTo($elt, { opacity: 0, y: '100%' }, { opacity: 1, y: 0, duration: 1, delay: index * 0.1, ease: 'cubic.out' }, 'seq-1');
				});
				timeline.fromTo($text, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: eltsLength*0.1 + 0.1, ease: 'cubic.out' }, 'seq-1');
				timeline.fromTo($btn, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: eltsLength*0.1 + 0.2, ease: 'cubic.out' }, 'seq-1');
				// timeline.fromTo($bg, { y: "10%" }, { y: 0, duration: 1, ease: 'cubic.out' }, 'seq-1');
				
				timeline.fromTo($inwrap, { opacity: 1, y: 0 }, { opacity: 0, y: -50, duration: 1, ease: 'cubic.out' }, 'seq-2');
			}
		})();


		// satellite
		(() => {
			const $section = $main.querySelector('.satellite');
			const $earth = $section.querySelector('.earth');
			const $planet = $earth.querySelector('.planet');
			const $planetVideo = $planet.querySelector('video');
			const $sat = $earth.querySelector('.sat');
			const $satVideo = $sat.querySelector('video');
			const $inwrap = $section.querySelector('.inwrap');
			const $texts = $section.querySelector('.texts');
			const $elts = $section.querySelectorAll('.elt-s span span');;
			const $text = $section.querySelector('.text');
			const $btn = $section.querySelector('.btn-hud');
			const $bgSpace = $section.querySelector('.bg-space');

			let timeline, sectionHeight;

			// action
			state.on('scroll', (scrollTop) => {
				const rect = $section.getBoundingClientRect();
				if (rect.top < areaHeight && rect.bottom > 0) {
					const progress = -(rect.top - areaHeight*0.5) / (sectionHeight + areaHeight/2);
					timeline && timeline.progress(progress);

          if ( !isTablet ) {
						$texts.style.transform = `translate3d(0, ${progress*-120}px, 0)`;
						$bgSpace.style.transform = `translate3d(0, ${progress*-80}px, 0)`;
					} else {
						// $bgSpace.style.opacity = progress > (200/areaHeight) ? 1 : 0;
						// 200 만큼 모바일에서 당겼기 때문에 css로 
					}
				} else {
					if ( !$planetVideo.paused ) { $planetVideo.pause(); }
					if ( !$satVideo.paused ) { $satVideo.pause(); }
				}
			});
			state.on('resize', (areaWidth, areaHeight) => {
				sectionHeight = $section.offsetHeight;
			});

			state.on('mediachange', (media) => {
				createTimeline();
				
				if ( media !== 'desktop' ) {
					$texts.style.transform = '';
					$bgSpace.style.transform = '';
				}
			});

			// event
			const createTimeline = function () {
				timeline && timeline.kill();
				resetNodes($section);
				timeline = gsap.timeline({ paused: true });

				const eltsLength = $elts.length;

				timeline.fromTo($earth, { y: areaHeight/2 }, { y: 0, duration: 1, ease: 'power1.out',
					onStart: () => { $planetVideo.play(); }
				}, 'seq-0');
				$elts.forEach(($elt, index) => {
					timeline.fromTo($elt, { opacity: 0, y: "100%" }, { opacity: 1, y: 0, duration: 1, delay: index * 0.1, ease: 'cubic.out' }, isTablet ? 'seq-0' : 'seq-1');
				});
				timeline.fromTo($text, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: eltsLength*0.1 + 0.1, ease: 'cubic.out' }, isTablet ? 'seq-0' : 'seq-1');
				timeline.fromTo($btn, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: eltsLength*0.1 + 0.2, ease: 'cubic.out' }, isTablet ? 'seq-0' : 'seq-1');
				timeline.fromTo($sat, { opacity: 0 }, { opacity: 1, duration: .8, delay: .2, ease: 'cubic.out' }, 'seq-1');
				timeline.fromTo($planet, { opacity: 1 }, { opacity: 0, duration: .8, delay: .2, ease: 'cubic.out',
					onStart: () => { $satVideo.play(); },
					onComplete: () => { $planetVideo.pause(); },
				}, 'seq-1');

				timeline.fromTo($inwrap, { opacity: 1, y: 0 }, { opacity: 0, y: -50, duration: 1, ease: 'cubic.out',
					onUpdate: () => { if ( $satVideo.paused ) $satVideo.play(); },
					onReverseComplete: () => { $planetVideo.play(); }
				}, 'seq-2');
			}
		})();

		// exploration
		(() => {
			const $section = $main.querySelector('.exploration');
			const $elts = $section.querySelectorAll('.elt-s span span');
			const $inwrap = $section.querySelector('.inwrap');
			const $texts = $section.querySelector('.texts');
			const $text = $section.querySelector('.text');
			const $btn = $section.querySelector('.btn-hud');
			const $bg = $section.querySelector('.bg');
			const $bgSpace = $section.querySelector('.bg-space');

			let timeline, timelineBg, sectionHeight;

			// action
			state.on('scroll', (scrollTop) => {
				const rect = $section.getBoundingClientRect();
				if (rect.top < areaHeight && rect.bottom > 0) {
					const progress = !isTablet ? -(rect.top - areaHeight*0.5) / sectionHeight : -(rect.top - areaHeight*0.5) / (areaHeight*1.5);
					timeline && timeline.progress(progress);
					
          if ( !isTablet ) {
						$texts.style.transform = `translate3d(0, ${progress*-120}px, 0)`;
						$bgSpace.style.transform = `translate3d(0, ${progress*-80}px, 0)`;

						const progressBg = (-rect.top - (sectionHeight-areaHeight)) / areaHeight;
						timelineBg && timelineBg.progress(progressBg);
					}
				}
			});
			state.on('resize', (areaWidth, areaHeight) => {
				sectionHeight = $section.offsetHeight - areaHeight;
			});

			state.on('mediachange', (media) => {
				createTimeline();
				
				if ( media !== 'desktop' ) {
					$texts.style.transform = '';
					$bgSpace.style.transform = '';
				}
			});

			// event
			const createTimeline = function () {
				timeline && timeline.kill();
				resetNodes($section);
				timeline = gsap.timeline({ paused: true });

				const eltsLength = $elts.length;
				$elts.forEach(($elt, index) => {
					timeline.fromTo($elt, { opacity: 0, y: "100%" }, { opacity: 1, y: 0, duration: 1, delay: index * 0.1, ease: 'cubic.out' }, 'seq-1');
				});
				timeline.fromTo($text, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: eltsLength*0.1 + 0.1, ease: 'cubic.out' }, 'seq-1');
				timeline.fromTo($btn, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: eltsLength*0.1 + 0.2, ease: 'cubic.out' }, 'seq-1');

				// timeline.fromTo($bg, { y: 0 }, { y: -areaHeight*0.3, duration: 1, ease: 'power1.out' }, 'seq-2');
				timeline.fromTo($inwrap, { opacity: 1, y: 0 }, { opacity: 0, y: -100, duration: 1, ease: 'power1.out' }, 'seq-2');

				// bg timeline
				timelineBg && timeline.kill();
				timelineBg = gsap.timeline({ paused: true });
				timelineBg.fromTo($bg, { y: 0 }, { y: -areaHeight*0.3, duration: 1, ease: 'power1.out' }, 'seq-2');
			}
		})();

		// space-kids
		(() => {
			const $section = $main.querySelector('.space-kids');
			const $orbit = $section.querySelector('.orbit');
			const $texts = $section.querySelector('.texts');
			
			const $ment = $section.querySelector('.ment');
			const $btn = $section.querySelector('.btn-hud');

			let timeline, sectionHeight;

			// action
			state.on('scroll', (scrollTop) => {
				const rect = $section.getBoundingClientRect();
				if (rect.top < areaHeight && rect.bottom > 0) {
					// const progress = -(rect.top - areaHeight/2) / (sectionHeight + areaHeight/2);
					const progress = -(rect.top - areaHeight/2) / (sectionHeight + areaHeight/2);
					timeline && timeline.progress((progress));

					// if ( progress > 1 || progress == 0 ) timeline.progress(1);
					if ( !isTablet ) $texts.style.transform = `translate3d(0, ${progress*-150}px, 0)`;
					if ( progress < 0 ) $orbit.classList.remove('active');
				}
			});
			state.on('resize', (areaWidth, areaHeight) => {
				sectionHeight = $section.offsetHeight;
			});

			state.on('mediachange', (media) => {
				createTimeline();
				
				if ( media !== 'desktop' ) {
					$texts.style.transform = '';
				}
			});

			// event
			const createTimeline = function () {
				timeline && timeline.kill();
				resetNodes($section);
				timeline = gsap.timeline({ paused: true });

				const $elts = $section.querySelectorAll('.elt-s');
				const styles = { orbitRotate: 0 };
				
				$elts[0].querySelectorAll('span span').forEach(($elt, index) => {
					timeline.fromTo($elt, { opacity: 0, y: '120%' }, { opacity: 1, y: 0, duration: 1, ease: 'quart.out',
						onStart: () => { $orbit.classList.add('active'); }, 
					}, 'seq-1');
					timeline.to($elt, { opacity: 0, y: -40, duration: 1, ease: 'quart.out' }, 'seq-2');
				});
				if ( !isTablet )  timeline.fromTo($orbit, { x: 100, y: 100, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 1, ease: 'quart.out' }, 'seq-1');
				else              timeline.fromTo($orbit, { scale: 1.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: 'quart.out' }, 'seq-1');

				$elts[1].querySelectorAll('span span').forEach(($elt, index) => {
					timeline.fromTo($elt, { opacity: 0, y: '120%' }, { opacity: 1, y: 0, duration: 1, ease: 'quart.out' }, 'seq-2');
					timeline.to($elt, { opacity: 0, y: "-120%", duration: 1, ease: 'quart.out' }, 'seq-3');
				});
				if ( !isTablet )  timeline.to(styles, { orbitRotate: -2, duration: 1, ease: 'power2.inout', onUpdate: updateOrbitRotate }, 'seq-2');
				else              timeline.to(styles, { orbitRotate: -10, duration: 1, ease: 'linear', onUpdate: updateOrbitRotate }, 'seq-2');

				$elts[2].querySelectorAll('span span').forEach(($elt, index) => {
					timeline.fromTo($elt, { opacity: 0, y: '120%' }, { opacity: 1, y: 0, duration: 1, ease: 'quart.out' }, 'seq-3');
				});
				timeline.fromTo($btn, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'quart.out' }, 'seq-3');
				if ( !isTablet )  timeline.to(styles, { orbitRotate: -3.5, duration: 1, ease: 'power2.inout', onUpdate: updateOrbitRotate }, 'seq-3');
				else              timeline.to(styles, { orbitRotate: -20, duration: 1, ease: 'linear', onUpdate: updateOrbitRotate }, 'seq-3');

				timeline.to($orbit, { opacity: 0, duration: 1, ease: 'quart.out' }, 'seq-4');
				if ( !isTablet )  timeline.to(styles, { orbitRotate: -5, duration: 1, ease: 'power2.inout', onUpdate: updateOrbitRotate }, 'seq-4');
				else              timeline.to(styles, { orbitRotate: -30, duration: 1, ease: 'linear', onUpdate: updateOrbitRotate }, 'seq-4');

				function updateOrbitRotate () {
					$orbit.style.setProperty('--orbit-rotate', -styles.orbitRotate + 'deg')
					if ( !isTablet ) $orbit.style.transform = `translate3d(0, 0, 0) scale(1) rotate(${styles.orbitRotate}deg)`
					else $orbit.style.transform = `translate3d(-50%, -50%, 0) scale(1) rotate(${styles.orbitRotate}deg)`
				}
			}
		})();

    // spacehub
    (() => {
      const $section = $main.querySelector('.spacehub');
      const $bg = $section.querySelector('.bg');
      // const $ment = $section.querySelector('.ment');
      const $texts = $section.querySelector('.texts');
      const $text = $section.querySelector('.ment');
      const $btn = $section.querySelector('.btn-hud');

      let timeline, sectionHeight;

      // action
      state.on('scroll', (scrollTop) => {
        const rect = $section.getBoundingClientRect();
        if (rect.top < areaHeight && rect.bottom > 0) {
          const progress = -(rect.top - areaHeight*0.4) / areaHeight;
          timeline && timeline.progress(progress);

          if ( !isTablet ) $texts.style.transform = `translate3d(0, ${progress*-120}px, 0)`;
        }
      });
      state.on('resize', (areaWidth, areaHeight) => {
        sectionHeight = $section.offsetHeight - areaHeight;
      });

      state.on('mediachange', (media) => {
        createTimeline();
				
				if ( media !== 'desktop' ) {
					$texts.style.transform = '';
				}
      });

      // event
      const createTimeline = function () {
        timeline && timeline.kill();
        resetNodes($section);
        timeline = gsap.timeline({ paused: true });

				const $elts = $section.querySelectorAll('.elt-s span span');
				$elts.forEach(($elt, index) => {
					timeline.fromTo($elt, { opacity: 0, y: "120%" }, { opacity: 1, y: 0, duration: 1, delay: index * 0.1, ease: 'quart.out' }, 'seq-1');
				});
        timeline.fromTo($bg, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'quart.out' }, 'seq-1');
        timeline.fromTo($text, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: .3, ease: 'quart.out' }, 'seq-1');
        timeline.fromTo($btn, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: .4, ease: 'quart.out' }, 'seq-1');
      }
    })();


    // network
    (() => {
      const $section = $main.querySelector('.network');
      const $networkVisual = $section.querySelector('.video-content');
      const $networkVisualTexts = $section.querySelector('.network-texts');
      const $video = $section.querySelector('.visual video');

      let timeline, sectionHeight;

      // action
      state.on('scroll', (scrollTop) => {
        const rect = $section.getBoundingClientRect();
        if (rect.top < areaHeight && rect.bottom > 0) {
          const progress = -(rect.top - areaHeight*0.5) / sectionHeight;
          // timeline && timeline.progress(progress);
          // if ( progress > 1 || progress == 0 ) timeline.progress(1);

          if ( progress > 0 && $video.paused ) {
            $section.classList.add('show');
            $video.play();
          }
        } else {
          // timeline && timeline.progress(1);
          if ( $section.classList.contains('show') ) $section.classList.remove('show');
          if ( !$video.paused ) $video.pause();
        }
      });
      state.on('resize', (areaWidth, areaHeight) => {
        sectionHeight = $section.offsetHeight;
        // createTimeline();
      });

      // event
      const createTimeline = function () {
        timeline && timeline.kill();
        resetNodes($section);
        timeline = gsap.timeline({ paused: true });
      }
    })();






	})();
});


// gsap style reset
function resetNodes($target) {
  [].forEach.call($target.querySelectorAll('*'), ($node) => {
    $node._gsap && gsap.set($node, { clearProps: true });
  });
}


document.addEventListener('DOMContentLoaded', function () {
    const htmlTag = document.querySelector('html');
    const body = document.querySelector('body');

    const observer = new MutationObserver(function (mutationsList) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (htmlTag.classList.contains('mobile-menu-open')) {
                    if (body.classList.contains('pace-done') && body.classList.contains('pace-running')) {
                        body.style.overflow = 'hidden';
                    }
                } else {
                    body.style.overflow = '';
                }
            }
        }
    });

    observer.observe(htmlTag, {
        attributes: true
    });
});















