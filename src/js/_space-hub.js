import gsap, { Cubic } from 'gsap';
import lottie from 'lottie-web';

import * as state from './state';
import { areaWidth, areaHeight, imagePath } from './common';
import { createVideoNode, createSvgPathTimeline } from './util';
import {language} from './common'


state.on('enter', () => {
	document.querySelector('main.space-hub') && (() => {
		const $main = document.querySelector('main.space-hub');

		// vision
		(() => {
			const $vision = $main.querySelector('.vision');

			// intro
			(() => {
				const $intro = $main.querySelector('.intro');
				const $children = $main.querySelectorAll('.intro .sticky > *:not(video)');
				const $video = $intro.querySelector('video');
				const $ment = $children[2];

				let timeline, introHeight;

				$ment.dataset.content = $ment.innerHTML;

				state.on('scroll', (scrollTop) => {
					const rect = $intro.getBoundingClientRect();
					if (rect.top < areaHeight && rect.bottom > 0) {
						const progress = -rect.top / introHeight;
						timeline.progress(progress);
						if ($video.paused) {
							$video.play();
						}
						// $video.style.opacity = Math.max(0, Math.min(1, 1 - (progress - 1) / 0.1));
					} else if (!$video.paused) {
						$video.pause();
					}
				});

				state.on('mediachange', (media) => {
					createTimeline();
				});

				state.on('resize', (areaWidth, areaHeight) => {
					introHeight = $intro.offsetHeight - areaHeight;
				});


				function createTimeline () {
					timeline && timeline.kill();
					timeline = gsap.timeline({ paused: true });

					timeline.fromTo($children[0], { y: 0, opacity: 1 }, { y: -100, opacity: 0, duration: 1, ease: 'cubic.in' });

					timeline.fromTo($children[1].children[0], { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 1.3);
					timeline.fromTo($children[1], { y: 0, opacity: 1 }, { y: -100, opacity: 0, duration: 1, ease: 'cubic.in' });

					$ment.innerHTML = `<span>${ $ment.dataset.content.split(state.states.media === 'mobile' ? /<br *(?=class=".+")[^>]*\/?>/ : /<br *\/?>/).join('</span><span>') }</span>`;
					for (let i = 0, max = $ment.children.length; i < max; i++) {
						timeline.fromTo($ment.children[i], { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 3.5 + i * 0.4);
					}
				}
			})();

			// challenge
			(() => {
				const $challenge = $main.querySelector('.challenge');
				const $video = $challenge.querySelector('video');
				const $ment = $challenge.querySelector('.ment');
				const $mentHighlights = [].slice.call($ment.querySelectorAll('span'));
				const $mentMobile = $challenge.querySelector('.ment.mobile');
				const $mentMobileHighlights = [].slice.call($mentMobile.querySelectorAll('span'));
				const numMentHighlights = $mentHighlights.length;

				let challengeHeight, mentProgressHeight;

				const mentTimeline = gsap.timeline({ paused: true });
				$mentHighlights.forEach(($highlight, index) => {
					if (index > 0) {
						mentTimeline.to([$highlight, $mentMobileHighlights[index]], { opacity: 1, duration: 1, ease: 'power2.inOut' }, '-=1');
					}
					if (index !== $mentHighlights.length - 1) {
						mentTimeline.to([$highlight, $mentMobileHighlights[index]], { opacity: 0.2, duration: 1, delay: index > 0 ? 0.1 : 0, ease: 'power2.inOut' });
					}
				});

				state.on('scroll', (scrollTop) => {
					const rect = $challenge.getBoundingClientRect();
					if (rect.top < areaHeight && rect.bottom > 0) {
						const progress = -rect.top / challengeHeight;
						mentTimeline.progress(progress);

						if ($video.paused) {
							$video.play();
						}
						// const videoProgress = Math.max(0, (progress + 0.2) / 0.1);
						// $video.style.opacity = videoProgress;
						// if (videoProgress > 0 && $video.paused) {
						// 	$video.play();
						// }
						// if (videoProgress > 1) {
						// 	const videoProgress2 = 1 - Math.max(0, (progress - 0.7) / 0.1);
						// 	$video.style.opacity = videoProgress2;
						// 	if (videoProgress2 < 0 && !$video.paused) {
						// 		$video.pause();
						// 	}
						// }
						// $video.style.transform = `scale(${ Cubic.easeIn(1 - Math.min(1, Math.max(0, progress / 0.5))) + 1 })`;

						// const mentRect = $ment.getBoundingClientRect();
						// const mentProgress = (areaHeight * 0.75 - mentRect.top) / mentProgressHeight;
						// mentTimeline.progress(mentProgress);
					} else if (!$video.paused) {
						$video.pause();
					}
				});

				state.on('resize', (areaWidth, areaHeight) => {
					challengeHeight = $challenge.offsetHeight - areaHeight;
					mentProgressHeight = (areaHeight * 0.75) - (areaHeight * 0.45 - $ment.offsetHeight);
				});
			})();
		})();

		// featured history
		(() => {
			// return;
			const $section = $main.querySelector('.featured-history');
			const $list = $section.querySelector('.featured-list');
			const $items = [].slice.call($list.children);
			const $lastItem = $list.querySelector('li:last-child');
			const $lastItemImage = $lastItem.querySelector('img');
			const $lastItemTexts = [].slice.call($lastItem.querySelectorAll('em, p'));
			const $videoWrap = document.createElement('div');
			const $video = createVideoNode(`${ imagePath }space-hub/history.webm`);
			const items = [];
			const numItems = $items.length;

			const $ment = $section.querySelector('.ment');

			let sectionHeight, canMoveValue,
				lastItemWidth, lastItemHeight, lastItemMaxGapWidth, lastItemImageMaxScale;


			$items.forEach(($item, index) => {
				const item = { show: null };
				const $svg = $item.querySelector('svg');
				const timeline = gsap.timeline({ paused: true });
				if ($item.querySelector('em')) {
					timeline.fromTo($item.querySelector('em'), { opacity: 0 }, { opacity: 1, duration: 1, ease: 'quad.out' });
				}
				timeline.fromTo($item.querySelector('h4, .text'), { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.2);
				if ($svg) {
					timeline.add(createSvgPathTimeline($svg, 1.5, 'rgba(18, 18, 18, 0)'), 0);
				} else if ($item.querySelector('img')) {
					timeline.fromTo($item.querySelector('img'), { opacity: 0 }, { opacity: 1, duration: 1.5, ease: 'quad.out' }, 0);
				}
				item.timeline = timeline;
				items[index] = item;
			});

			$videoWrap.className = 'video-wrap';
			$videoWrap.appendChild($video);
			$lastItem.insertBefore($videoWrap, $lastItem.firstChild);


			state.on('scroll', (scrollTop) => {
				const rect = $section.getBoundingClientRect();
				if (rect.top < areaHeight && rect.bottom > 0) {
					let videoProgress = 0;

					if (state.states.media !== 'mobile') {
						const progress = ((-rect.top / sectionHeight) - 0.1) / 0.9;
						gsap.set($list, {x: -canMoveValue * Math.max(0, Math.min(1, progress))});

						const _lastItemWidth = Math.max(lastItemWidth, areaWidth - $lastItem.getBoundingClientRect().left);
						$lastItem.style.width = _lastItemWidth + 'px';

						const scaleProgress = ((_lastItemWidth - lastItemWidth) / lastItemMaxGapWidth);
						const scale = lastItemImageMaxScale * scaleProgress + 1;
						$lastItemImage.style.transform = `translate(-50%, -50%) scale(${ scale })`;

						videoProgress = Math.max(0, (scaleProgress - 0.5) / 0.5);

						if (rect.top < areaHeight / 3) {
							let numVisibleItems = 0;
							for (let i = 0; i < numItems; i++) {
								const item = items[i];
								const itemRect = $items[i].getBoundingClientRect();
								if (itemRect.left < areaWidth - lastItemWidth / 2) {
									if (!item.show) {
										item.timer = gsap.delayedCall(numVisibleItems * 0.3, () => {
											item.timeline.play();
										});
										item.show = true;
										numVisibleItems++;
									}
								} else if (itemRect.left > areaWidth) {
									resetItem(item);
								}
							}
						} else if (rect.top > areaHeight - 100) {
							for (let i = 0; i < numItems; i++) {
								resetItem(items[i]);
							}
						}

						// if (1 - videoProgress * 2 < 1) {
						// 	for (let i = 0; i < 2; i++) {
						// 		$lastItemTexts[i].style.opacity = 1 - videoProgress * 2;
						// 	}
						// }

						// $ment.style.opacity = (progress - 1) / (overflowRatio);
					} else {
						const lastItemRect = $lastItem.getBoundingClientRect();
						const scaleProgress = Math.min(1, Math.max(0, -lastItemRect.top / (lastItemHeight - areaHeight)));
						const translateY = areaHeight / 2 - $items[1].offsetHeight / 2;
						const scale = lastItemImageMaxScale * scaleProgress + 1;
						$lastItemImage.style.transform = `translate(-50%, calc(-50% - ${ translateY }px * ${ 1 - scaleProgress })) scale(${ scale })`;

						videoProgress = Math.min(1, Math.max(0, scaleProgress / 0.3));

						for (let i = 0; i < numItems; i++) {
							const item = items[i];
							const itemRect = $items[i].getBoundingClientRect();
							if (itemRect.top < areaHeight / 3) {
								if (!item.show) {
									item.timer = gsap.delayedCall(0, () => {
										item.timeline.play();
									});
									item.show = true;
								}
							} else if (itemRect.top > areaHeight) {
								resetItem(item);
							}
						}
					}

					$videoWrap.style.opacity = videoProgress;
					if (videoProgress > 0) {
						if ($video.paused) {
							$video.play();
						}
					} else if (!$video.paused) {
						$video.pause();
					}
				} else {
					if (!$video.paused) {
						$video.pause();
					}
					if (rect.top < areaHeight && items[0].show === null) {
						for (let i = 0; i < numItems; i++) {
							resetItem(items[i], true);
						}
					}
				}
			});

			state.on('resize', (areaWidth, areaHeight) => {
				$section.style.height = '';
				$lastItem.style.width = '';

				lastItemWidth = $lastItem.offsetWidth;
				lastItemHeight = $lastItem.offsetHeight;
				lastItemMaxGapWidth = areaWidth - lastItemWidth;

				const sideGap = areaWidth > 1440 ? 167 : areaWidth > 768 ? 40 : 16;
				lastItemImageMaxScale = (areaWidth - sideGap * 2) / $lastItemImage.offsetWidth - 1;

				canMoveValue = $list.offsetWidth - lastItemWidth;
				sectionHeight = $section.offsetHeight + canMoveValue;

				$section.style.height = sectionHeight + 'px';

				$ment.style.width = areaWidth + 'px';

				sectionHeight -= areaHeight;
			});

			function resetItem (item, isEnded) {
				if (item.show || isEnded) {
					item.timeline.pause();
					item.timeline.progress(isEnded ? 1 : 0);
					item.timer && item.timer.kill();
					item.show = false;
				}
			}
		})();

		// history
		(() => {
			const $section = $main.querySelector('.history');
			const $listBox = $section.querySelector('.list');
			const $texts = $section.querySelectorAll('dt, dd');
			const numTexts = $texts.length;
			const $path = document.createElement('div');
			const pathControl = {
				y: -5000,
				update: () => {
					$path.style.setProperty('--path-y', pathControl.y + 'px');
				}
			};
			$path.className = 'path';
			$path.innerHTML = '<span class="path-inner"></span>';
			$section.children[0].appendChild($path);

			let sectionHeight, pathHeight;

			const timeline = gsap.timeline({ paused: true });
			for (let i = 0; i < numTexts; i++) {
				timeline.fromTo($texts[i], { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'cubic.out' }, i % 2 === 0 ? null : '-=0.5');
			}

			state.on('scroll', (scrollTop) => {
				const rect = $listBox.getBoundingClientRect();
				if (rect.top < areaHeight && rect.bottom > 0) {
					const progress = ((-rect.top / sectionHeight) + 0.2) / 0.9;
					timeline.progress(Math.max(0, progress));

					pathControl.tween && pathControl.tween.kill();
					pathControl.tween = gsap.to(pathControl, 0.2, { y: Math.max(-pathHeight, Math.min(0, -pathHeight + (-rect.top + areaHeight / 2))), ease: 'cubic.out', onUpdate: pathControl.update });
					// $path.style.setProperty('--path-y', Math.max(-pathHeight, Math.min(0, -pathHeight + (-rect.top + areaHeight / 2))) + 'px');
				}
			});

			state.on('resize', (areaWidth, areaHeight) => {
				sectionHeight = $listBox.offsetHeight;
				pathHeight = $path.offsetHeight;
			});
		})();

		// value chain
		(() => {
			// return;
			const $section = $main.querySelector('.value-chain');
			const $stars = $section.querySelector('.stars');
			const $forEarth = $section.querySelector('.for-earth');
			const $forEarthVisual = $forEarth.querySelector('.visual');
			const $forEarthVideo = $forEarth.querySelector('video');
			const $forEarthTexts = $forEarth.querySelector('.texts');
			const $future = $section.querySelector('.future');
			const $futureVisual = $future.querySelector('.visual');
			const $futureVideo = $future.querySelector('video');
			const $futureTexts = $future.querySelector('.texts');

			let sectionHeight, timeline;

			const lottieOptions = { renderer: 'svg', loop: true, autoplay: false };
			
			let ValueChainPath = (language == 'ko') ? `${ imagePath }space-hub/08_ValueChain_0413_01.json` : `${ imagePath }space-hub/08_ValueChain_0525_en.json`
			let ValueChainPathBack = (language == 'ko') ? `${ imagePath }space-hub/09_ValueChain_back_0410_01.json` : `${ imagePath }space-hub/09_ValueChain_back_0525_en.json`
			let ValueChainPathFront = (language == 'ko') ? `${ imagePath }space-hub/09_ValueChain_front_0410_01.json` : `${ imagePath }space-hub/09_ValueChain_front_0525_en.json`
			
			const lottieForEarth = lottie.loadAnimation({
				container: $forEarthVisual.querySelector('.roadmap'),
				path: ValueChainPath,
				...lottieOptions,
				loop: false
			});
			const lottieFuture = lottie.loadAnimation({
				container: $futureVisual.querySelector('.roadmap'),
				path: ValueChainPathBack,
				...lottieOptions
			});
			const lottieFutureMoon = lottie.loadAnimation({
				container: $futureVisual.querySelector('.roadmap-moon'),
				path: ValueChainPathFront,
				...lottieOptions
			});

			function resetLottie (target) {
				target.goToAndStop(0);
				target._resetted = true;
			}

			// console.log(lottieForEarth)

			state.on('scroll', (scrollTop) => {
				const rect = $section.getBoundingClientRect();
				if (rect.top < areaHeight && rect.bottom > 0) {
					const progress = -rect.top / sectionHeight;
					timeline && timeline.progress(Math.max(0, progress));
					$stars.style.setProperty('--stars-opacity', (1 - rect.top / areaHeight) * 2);

					// console.log(progress);

					if (progress > 0.25) {
						if (lottieForEarth.isPaused) {
							lottieForEarth._resetted = false;
							lottieForEarth.play();
						}
					} else if (progress < 0 && !lottieForEarth._resetted) {
						resetLottie(lottieForEarth);
					}

					if (progress > -0.5) {
						if ($forEarthVideo.paused) {
							$forEarthVideo.play();
						}
					} else if (!$forEarthVideo.paused) {
						$forEarthVideo.pause();
					}
					if (progress > 0.5) {
						if ($futureVideo.paused) {
							$futureVideo.play();
						}
					} else if (!$futureVideo.paused) {
						$futureVideo.pause();
					}
				} else if (!$forEarthVideo.paused) {
					$forEarthVideo.pause();
					$futureVideo.pause();
					if (rect.top > areaHeight && !lottieFuture.isPaused) {
						resetLottie(lottieFuture);
						resetLottie(lottieFutureMoon);
					}
				}
			});

			state.on('resize', (areaWidth, areaHeight) => {
				sectionHeight = $section.offsetHeight - areaHeight;

				let scale, textsRect, textMargin, visualRect, offset, overlap;

				if (state.states.media !== 'mobile') {
					textsRect = $forEarthTexts.getBoundingClientRect();
					textMargin = areaWidth > 1440 ? 120 : 50;
					$forEarthVisual.style.right = textsRect.width + textMargin + Math.min(textMargin, areaWidth / 20) + 'px';
					scale = Math.min(1, (areaWidth - (textsRect.width + textMargin + Math.min(textMargin, areaWidth / 20) + 50)) / $forEarthVisual.offsetWidth);
					$forEarthVisual.style.transform = `translate(0, -50%) scale(${ scale })`;
					$forEarthVisual.style.setProperty('--text-scale', 1 / scale);

					scale = Math.min(1, (areaHeight - 160) / $futureVisual.offsetHeight);
					$futureVisual.style.transform = `translate(-50%, -50%) scale(${ scale })`;
					textsRect = $futureTexts.getBoundingClientRect();
					visualRect = $futureVisual.getBoundingClientRect();
					overlap = (language == 'ko') ? 170 : 250
					offset = Math.max(0, textsRect.right - overlap - visualRect.left);
					$futureVisual.style.transform = `translate(calc(-50% + ${ offset }px), -50%) scale(${ scale })`;
					scale = Math.max(0.6, scale * Math.min(1, (areaWidth - visualRect.left - offset - textsRect.left - 180) / visualRect.width));
					offset *= scale;
					$futureVisual.style.transform = `translate(calc(-50% + ${ offset }px), -50%) scale(${ scale })`;
					$futureVisual.style.setProperty('--text-scale', 1 / scale);
				} else {
					$forEarthVisual.style.right = 
					$forEarthVisual.style.transform = 
					$futureVisual.style.transform = '';
				}

				createTimeline();
			});

			function createTimeline () {
				timeline && timeline.kill();
				timeline = gsap.timeline({ paused: true, delay: 1 });

				if (state.states.media !== 'mobile') {
					gsap.set($forEarthVisual.querySelector('.earth'), { x: 0, y: 0, scale: 1, rotation: 0 });
					gsap.set($futureVisual.querySelector('.roadmap'), { scale: 1 });
					const earthFrom = $forEarthVisual.querySelector('.earth').getBoundingClientRect();
					const earthTo = $futureVisual.querySelector('.roadmap').getBoundingClientRect();

					timeline.fromTo($forEarthTexts.children[0], { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
					timeline.fromTo($forEarthTexts.children[1], { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.75');
					timeline.fromTo($forEarthVisual.querySelector('.earth'), { x: -areaWidth * 0.6 }, { x: 0, duration: 2, ease: 'power3.out' }, 0);
					timeline.fromTo($forEarthVisual.querySelector('.earth .line'), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'quad.out' }, '-=1');
					timeline.fromTo($forEarthVisual.querySelector('.roadmap'), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'cubic.out' }, '-=0.75');
					// timeline.fromTo($forEarthVisual.querySelectorAll('.text'), { opacity: 0 }, { opacity: 1, duration: 1, ease: 'cubic.out' }, '-=1');

					let sequence2StartAt = timeline.totalDuration() + 1;

					timeline.fromTo($futureTexts.children[0], { autoAlpha: 0, y: 100 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, sequence2StartAt + 1);
					timeline.fromTo($futureTexts.children[1], { autoAlpha: 0, y: 100 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.75');
					timeline.fromTo($futureVisual.querySelector('.moon'), { autoAlpha: 1, x: '-150%' }, { autoAlpha: 1, x: 0, duration: 3, ease: 'power4.inOut' }, sequence2StartAt);
					timeline.fromTo($futureVisual.querySelector('.roadmap'), { autoAlpha: 0, scale: 1.2 }, {
						autoAlpha: 1, scale: 1, duration: 1, ease: 'power3.out',
						onStart: () => {
							if (lottieFuture.isPaused) {
								lottieFuture.play();
							}
						}
					}, '-=1');
					timeline.fromTo($futureVisual.querySelector('.roadmap-moon'), { autoAlpha: 0, x: -200 }, {
						autoAlpha: 1, x: 0, duration: 1, ease: 'power3.out',
						onStart: () => {
							if (lottieFutureMoon.isPaused) {
								lottieFutureMoon.play();
							}
						}
					}, '-=1');

					const forEarthVisualScale = $forEarthVisual.getBoundingClientRect().width / $forEarthVisual.offsetWidth;
					const futureVisualScale = $futureVisual.getBoundingClientRect().width / $futureVisual.offsetWidth;
					const earthTween = gsap.to($forEarthVisual.querySelector('.earth'), {
						x: ((earthTo.left + earthTo.width / 2) - (earthFrom.left + earthFrom.width / 2)) * 1 / forEarthVisualScale,
						y: ((earthTo.top + earthTo.height / 2) - (earthFrom.top + earthFrom.height / 2)) * 1 / forEarthVisualScale,
						scale: (120 * futureVisualScale) / earthFrom.height,
						rotation: -15,
						duration: 3,
						ease: 'power4.inOut',
						onUpdate: () => {
							gsap.set($forEarthVideo, { x: Math.sin(Math.pow(earthTween.ratio, 5) * Math.PI) * 300 });
						}
					});
					timeline.add(earthTween, sequence2StartAt);
					timeline.fromTo($stars, { backgroundSize: '200%' }, { backgroundSize: '100%', duration: 3, ease: 'power4.inOut' }, sequence2StartAt);

					timeline.to($forEarthTexts, { y: -30, duration: 1.5, ease: 'quad.out' }, sequence2StartAt - 0.5);
					timeline.to($forEarthTexts, { autoAlpha: 0, duration: 0.5, ease: 'quad.out' }, sequence2StartAt);
					timeline.to($forEarthVisual.querySelector('.roadmap'), { x: -50, autoAlpha: 0, duration: 1, ease: 'power3.out' }, sequence2StartAt);
					// timeline.to($forEarthVisual.querySelectorAll('.text'), { x: -50, autoAlpha: 0, duration: 1, ease: 'power3.out' }, sequence2StartAt);
					timeline.to($forEarthVisual.querySelector('.earth .line'), { autoAlpha: 0, duration: 1, ease: 'quad.out' }, sequence2StartAt);
				} else {
					gsap.set($forEarthVisual.querySelector('.earth'), { x: 0, y: 0, scale: 1, rotation: 0 });
					gsap.set($futureVisual.querySelector('.roadmap'), { scale: 1 });
					const earthFrom = $forEarthVisual.querySelector('.earth').getBoundingClientRect();
					const earthTo = $futureVisual.querySelector('.roadmap').getBoundingClientRect();

					$forEarthTexts.children[0].style.cssText = '';
					$forEarthTexts.children[1].style.cssText = '';
					timeline.fromTo($forEarthTexts.children[0], { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
					timeline.fromTo($forEarthTexts.children[1], { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.75');
					timeline.fromTo($forEarthVisual.querySelector('.earth'), { y: areaHeight * 0.3 }, { y: 0, duration: 2, ease: 'power3.out' }, 0);
					timeline.fromTo($forEarthVisual.querySelector('.earth .line'), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'quad.out' }, '-=1');
					timeline.fromTo($forEarthVisual.querySelector('.roadmap'), { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 1, ease: 'cubic.out' }, '-=1');
					// timeline.fromTo($forEarthVisual.querySelectorAll('.text'), { opacity: 0 }, { opacity: 1, duration: 1, ease: 'cubic.out' }, '-=1');

					let sequence2StartAt = timeline.totalDuration();

					timeline.fromTo($futureTexts.children[0], { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, sequence2StartAt + 1);
					timeline.fromTo($futureTexts.children[1], { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.75');
					timeline.fromTo($futureVisual.querySelector('.moon'), { autoAlpha: 1, y: areaHeight * 0.3 }, { autoAlpha: 1, y: 0, duration: 3, ease: 'power4.inOut' }, sequence2StartAt);
					timeline.fromTo($futureVisual.querySelector('.roadmap'), { autoAlpha: 0, scale: 1.1 }, { autoAlpha: 1, scale: 1, duration: 1, ease: 'power3.out' }, '-=1');
					timeline.fromTo($futureVisual.querySelector('.roadmap-moon'), { autoAlpha: 0, x: -50 }, { autoAlpha: 1, x: 0, duration: 1, ease: 'power3.out' }, '-=1');

					const forEarthVisualScale = $forEarthVisual.querySelector('video').getBoundingClientRect().width / $forEarthVisual.offsetWidth;
					const futureVisualScale = Math.min(earthTo.width / 316, earthTo.height / 312);
					timeline.to($forEarthVisual.querySelector('.earth'), {
						y: ((earthTo.top + earthTo.height / 2) - (earthFrom.top + earthFrom.height / 2)) - (10 + 7 * Math.max(1, earthTo.width / earthTo.height)) * futureVisualScale,
						scale: 40 * futureVisualScale / earthFrom.width,
						rotation: -15,
						duration: 3,
						ease: 'power4.inOut'
					}, sequence2StartAt);
					timeline.fromTo($stars, { backgroundSize: 'auto 200%' }, { backgroundSize: 'auto 100%', duration: 3, ease: 'power4.inOut' }, sequence2StartAt);

					timeline.fromTo($forEarthTexts, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.5, ease: 'quad.out' }, sequence2StartAt);
					timeline.to($forEarthVisual.querySelector('.roadmap'), { autoAlpha: 0, duration: 1, ease: 'power3.out' }, sequence2StartAt);
					timeline.to($forEarthVisual.querySelector('.earth .line'), { autoAlpha: 0, duration: 1, ease: 'quad.out' }, sequence2StartAt);
				}
			}
		})();

		// network
		(() => {
			const $section = $main.querySelector('.network');
			const $visual = $section.querySelector('.visual');
			const $video = $visual.querySelector('video');

			let sectionHeight, timeline;

			state.on('scroll', (scrollTop) => {
				const rect = $section.getBoundingClientRect();
				if (rect.top < areaHeight && rect.bottom > 0) {
					const progress = -rect.top / sectionHeight;
					timeline && timeline.progress(Math.max(0, progress));

					$visual.style.opacity = Math.min(1, (1 - rect.top / areaHeight) * 1.5);
					$visual.style.transform = 'scale(' + Math.max(1, Cubic.easeIn(Math.max(0, rect.top / areaHeight)) * 1.5 + 1) + ')';

					if (progress > -0.5) {
						if ($video.paused) {
							$video.play();
						}
					} else if (!$video.paused) {
						$video.pause();
					}
				} else if (!$video.paused) {
					$video.pause();
				}
			});

			state.on('resize', (areaWidth, areaHeight) => {
				sectionHeight = $section.offsetHeight - areaHeight;

				createTimeline();
			});

			function createTimeline () {
				timeline && timeline.kill();
				timeline = gsap.timeline({ paused: true, delay: 1 });

				timeline.fromTo($section.querySelector('.visual .network-texts'), { opacity: 0 }, { opacity: 1, duration: 1, ease: 'quad.out' });
				timeline.fromTo($section.querySelector('.cooperation h3'), { opacity: 0, y: '100%' }, { opacity: 1, y: 0, duration: 1, ease: 'quart.out' }, '-=0.5');
				timeline.fromTo($section.querySelector('.cooperation h4'), { opacity: 0, y: '100%' }, { opacity: 1, y: 0, duration: 1, ease: 'quart.out' }, '-=0.5');
				if (state.states.media !== 'mobile') {
					timeline.fromTo($section.querySelector('.cooperation p'), { opacity: 0, y: '100%' }, { opacity: 1, y: 0, duration: 1, ease: 'quart.out' }, '-=0.5');
					timeline.fromTo($section.querySelector('.cooperation ul'), { opacity: 0 }, { opacity: 1, duration: 1, ease: 'quart.out' });
				}

				// timeline.to($section.querySelector('.cooperation .content'), { opacity: 0, y: -50, duration: 1, delay: 0.2, ease: 'quart.out' });
				timeline.fromTo($section.querySelector('.cooperation .content'), { opacity: 1 }, { opacity: 0, duration: 1, delay: 0.1, ease: 'quad.out' });
				timeline.to($section.querySelector('.visual .network-texts'), { opacity: 0, duration: 1, ease: 'quad.out' }, '-=1');

				timeline.fromTo($section.querySelector('.partners h3'), { autoAlpha: 0, y: '100%' }, { autoAlpha: 1, y: 0, duration: 1, ease: 'quart.out' });
				timeline.fromTo($section.querySelector('.partners ul'), { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'quart.out' });
			}
		})();
	})();
});
























