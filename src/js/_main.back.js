import * as THREE from 'three';
import Swiper, { Parallax, Mousewheel, Pagination } from 'swiper';
import gsap from 'gsap';

import * as state from './state';
import { language, areaWidth, areaHeight, imagePath, historyManager } from './common';
import { createVideoNode, getCountDown, splitLetters, splitLineToBlock, removeNode, reflowTrick } from './util';


state.on('enter', () => {
	document.querySelector('main.main') && (() => {
		// historyManager.displayable = false;

		const $html = document.documentElement;

		const $slider = document.querySelector('.main-slide');
		const $slides = [].slice.call($slider.querySelectorAll('.main-slide > .swiper-wrapper > .swiper-slide'));
		const numSlides = $slides.length;

		const defaultIndex = 0;
		const duration = state.states.media === 'mobile' ? 0.75 : 1;


		const slider = (() => {
			state.on('scroll', onScroll);
			state.on('mediachange', onMediaChange);
			state.on('resize', onResize);

			const $slideBackgroundVideos = [];
			$slides.forEach(($slide, index) => {
				const $firstChild = $slide.children[0];
				if ($firstChild.nodeName.toLowerCase() === 'video') {
					$slideBackgroundVideos[index] = $firstChild;
				}
			});

			const $slideContentVideos = [];
			$slides.forEach(($slide, index) => {
				$slideContentVideos[index] = $slide.querySelector('.video-content');
			});


			// splitLineToBlock($slider.querySelectorAll('.index h2'));
			// splitLineToBlock($slider.querySelectorAll('.index .ment'), 2.5);
			// splitLineToBlock($slider.querySelectorAll('.intro h3'));

			const $pagination = $slider.querySelector('.pagination');
			$pagination.style.setProperty('--num-pages', numSlides);
			$pagination.innerHTML = `
				<button type="button" class="nav prev" disabled>Previous Slide</button>
				${ $slides.map(($slide, index) => {
					return `<button class="page${ !index ? ' first on' : index === numSlides - 1 ? ' last' : ''}" data-page="Page ${ index + 1 }">
								Page ${ index + 1 }
							</button>`;
				}).join('<span class="page-line" style="--progress: 0;"></span>') }
				<button type="button" class="nav next">Next Slide</button>
			`;
			const $paginationDots = [].slice.call($pagination.querySelectorAll('button.page'));
			const $paginationLines = [].slice.call($pagination.querySelectorAll('.page-line'));
			const $prevButton = $pagination.querySelector('.nav.prev');
			const $nextButton = $pagination.querySelector('.nav.next');

			$paginationDots.forEach(($dot, index) => {
				$dot.dataset.index = index;
				$dot.addEventListener('click', onPaginationDotClick);
			});
			$paginationDots[0].classList.add('current');

			$prevButton.addEventListener('click', () => {
				slider.slidePrev();
			});
			$nextButton.addEventListener('click', () => {
				slider.slideNext();
			});

			const $bannerWrap = $slider.querySelector('.swiper-slide.index .banner-wrap');
			if ($bannerWrap) {
				const $banner = $bannerWrap.querySelector('.banner');
				const $smallTexts = $banner.querySelector('.texts.small');
				const $expandedTexts = $banner.querySelector('.texts.expanded');
				const $visualVideo = $bannerWrap.querySelector('video');
				const $showTargets = [].slice.call($expandedTexts.querySelectorAll('[data-show-target]'));
				const onBannerCloseEvents = [];

				if ($visualVideo) {
					$banner.classList.add('has-video');
				}

				$expandedTexts.addEventListener('wheel', (e) => e.stopPropagation());
				$expandedTexts.addEventListener('pointerdown', (e) => e.stopPropagation());
				$expandedTexts.addEventListener('mousedown', (e) => e.stopPropagation());
				$expandedTexts.addEventListener('touchstart', (e) => e.stopPropagation());
				$banner.addEventListener('transitionend', (e) => {
					if (e.target === e.currentTarget && e.propertyName === 'top') {
						if ($html.classList.contains('expand-banner')) {
							$expandedTexts.classList.add('show');
							$showTargets.forEach(($target) => {
								$target.classList.add('show');
							});
						} else {
							if ($visualVideo) {
								$visualVideo.pause();
								$visualVideo.currentTime = 0;
							}
							onBannerCloseEvents.forEach((callback) => {
								callback && callback();
							});
						}
					}
				});
				$smallTexts.addEventListener('click', () => {
					$html.classList.add('expand-banner');
					$visualVideo && $visualVideo.play();
				});
				// $smallTexts.click(); // test

				$expandedTexts.addEventListener('transitionend', (e) => {
					if (e.target === e.currentTarget && e.propertyName === 'opacity' && $expandedTexts.classList.contains('hide')) {
						$expandedTexts.classList.remove('hide');
						$expandedTexts.classList.remove('show');
						$showTargets.forEach(($target) => {
							$target.classList.remove('show');
						});
					}
				});

				const $closeButton = document.createElement('button');
				$closeButton.type = 'button';
				$closeButton.className = 'banner-close-button';
				$closeButton.innerHTML = 'Close';
				$closeButton.addEventListener('click', () => {
					$expandedTexts.classList.add('hide');
					$html.classList.remove('expand-banner');
				});
				$closeButton.addEventListener('wheel', (e) => e.stopPropagation());
				$pagination.parentNode.insertBefore($closeButton, $pagination.nextSibling);

				window.NURI_LAUNCH_SCHEDULE && $banner.classList.contains('count-down') && (() => {
					const $numbers = [].slice.call($expandedTexts.querySelectorAll('p > strong'));
					const $splitedNumbers = [];

					const scheduleTime = new Date(NURI_LAUNCH_SCHEDULE).getTime();

					$expandedTexts.addEventListener('click', () => {
						location.href = (language === 'ko' ? '' : '/' + language) + '/launch/';
					});

					$numbers.forEach(($number) => {
						$splitedNumbers.push(splitLetters($number));
					});

					update();

					function update () {
						const numbers = getCountDown(scheduleTime);
						for (let index = 0; index < 4; index++) {
							const $splited = $splitedNumbers[index];
							for (let i = 0; i < 2; i++) {
								if (numbers[index][i] !== $splited[i].dataset.value) {
									$splited[i].dataset.value = numbers[index][i];
									$splited[i].innerHTML = numbers[index][i] + '<br>' + $splited[i].innerHTML.split(/<br *\/?>/)[0];
									$splited[i].classList.add('ready');
								}
							}
						}
						reflowTrick();
						for (let index = 0; index < 4; index++) {
							const $splited = $splitedNumbers[index];
							for (let i = 0; i < 2; i++) {
								$splited[i].classList.remove('ready');
							}
						}

						gsap.delayedCall(1, update);
					}
				})();

				const $spaceKidsSlider = document.querySelector('.space-kids-slide');
				if ($spaceKidsSlider) {
					const $applyButton = $spaceKidsSlider.parentNode.querySelector('.primary-button');
					const $pageIndicator = $spaceKidsSlider.parentNode.querySelector('.page-indicator');
					const $backgrounds = $spaceKidsSlider.parentNode.querySelector('.space-kids-backgrounds').children;
					const $slides = $spaceKidsSlider.querySelectorAll('.swiper-slide');
					const numSlides = $slides.length;
					const spaceKidsSlider = new Swiper($spaceKidsSlider, {
						modules: [Parallax, Mousewheel],
						direction: 'vertical',
						speed: 800,
						mousewheel: true,
						on: {
							slideChange: () => {
								const index = spaceKidsSlider.activeIndex;
								for (let i = 0; i < numSlides; i++) {
									$backgrounds[i].classList[i <= index ? 'add' : 'remove']('show');
								}
								$pageIndicator.style.display = index === numSlides - 1 ? 'none' : '';
							}
						}
						// initialSlide: 3
					});
					$pageIndicator.addEventListener('click', () => {
						spaceKidsSlider.slideNext(800);
					});

					const $guideline = $spaceKidsSlider.querySelector('.space-kids-guideline');
					const $guidelineParent = $guideline.parentNode;
					const $guidelineChildren = [].slice.call($guideline.children);
					const $guidelineSlider = document.createElement('div');
					$guidelineSlider.className = $guideline.className;
					$guidelineSlider.classList.add('swiper');
					const $guidelineSliderWrapper = document.createElement('ul');
					$guidelineSliderWrapper.classList.add('swiper-wrapper');
					$guidelineChildren.forEach(($child) => {
						[].forEach.call($child.children, ($slide) => {
							const $clone = $slide.cloneNode(true);
							$clone.classList.add('swiper-slide');
							$guidelineSliderWrapper.appendChild($clone);
						});
					});
					$guidelineSlider.appendChild($guidelineSliderWrapper);
					$guidelineParent.appendChild($guidelineSlider);
					const $guidelineSliderPagination = document.createElement('div');
					$guidelineSliderPagination.classList.add('swiper-pagination');
					$guidelineSlider.appendChild($guidelineSliderPagination);
					const guidelineSlider = new Swiper($guidelineSlider, {
						modules: [Pagination],
						speed: 800,
						pagination: {
							el: '.swiper-pagination',
							clickable: true
						}
					});
					removeNode($guidelineSlider);
					state.on('mediachange', (media) => {
						if (media !== 'mobile') {
							removeNode($guidelineSlider);
							$guidelineParent.appendChild($guideline);
							$spaceKidsSlider.parentNode.appendChild($applyButton);
						} else {
							removeNode($guideline);
							$guidelineParent.appendChild($guidelineSlider);
							guidelineSlider.update();
							guidelineSlider.slideTo(0, 0);
							$slides[0].appendChild($applyButton);
						}
					});
					onBannerCloseEvents.push(() => {
						spaceKidsSlider.slideTo(0, 0);
						guidelineSlider.slideTo(0, 0);
					});
				}
			}

			let currentIndex = defaultIndex;
			let isSliderMovingByUser = false;
			const animator = { progress: 0, linearProgress: 0 };

			const slider = new Swiper($slider, {
				modules: [Parallax, Mousewheel],
				speed: duration * 1000,
				mousewheel: true,
				initialSlide: defaultIndex,
				parallax: true,
				on: {
					init: () => requestAnimationFrame(onProgressChange),
					sliderMove: onSlideMoveByUser,
					slideChange: onSlideChange,
					slideChangeTransitionEnd: onSlideChangeEnd,
					progress: onSlideProgressChange
				}
			});

			state.on('display', () => {
				$slides[0].classList.add('show');
			});

			// slider.slideTo(1, 0);


			function onSlideChange () {
				for (let i = 0; i < numSlides; i++) {
					$paginationDots[i].classList[slider.activeIndex === i ? 'add' : 'remove']('current');
				}
			}

			function onSlideChangeEnd () {
				setCurrentSlideShow();
			}

			function onProgressChangeEnd () {
				setCurrentSlideShow();
			}

			function setCurrentSlideShow () {
				$slides.forEach(($slide) => {
					$slide.classList.remove('show');
				});
				$slides[slider.activeIndex].classList.add('show');
			}

			function onPaginationDotClick () {
				slider.slideTo(parseInt(this.dataset.index), duration * 1000);
			}

			function onSlideMoveByUser () {
				isSliderMovingByUser = true;
			}

			function onSlideProgressChange (swiper, _progress) {
				const progress = _progress / (1 / (numSlides - 1));
				if (isSliderMovingByUser) {
					animator.tween && animator.tween.kill();
					animator.progress = animator.linearProgress = progress;
					onProgressChange();
					isSliderMovingByUser = false;
				} else {
					if (progress !== animator.progress) {
						animator.linearTween && animator.linearTween.kill();
						animator.linearTween = gsap.to(animator, duration, { linearProgress: progress, ease: 'linear' });
						animator.tween && animator.tween.kill();
						animator.tween = gsap.to(animator, duration, { progress: progress, ease: 'quart.out', onUpdate: onProgressChange, onComplete: onProgressChangeEnd });
					}
					$prevButton.disabled = !progress;
					$nextButton.disabled = progress === numSlides - 1;
				}
			}

			function onProgressChange () {
				// const progress = Math.max(0, Math.min(numSlides - 1, animator.progress));
				const progress = animator.progress;
				const activeIndex = Math.floor(progress);
				for (let i = 0; i < numSlides; i++) {
					$paginationDots[i].classList[activeIndex >= i ? 'add' : 'remove']('on');
					if (i < numSlides - 1) {
						$paginationLines[i].style.setProperty('--progress', activeIndex < i ? 0 : activeIndex === i ? progress % 1 : 1);
					}
				}

				if (progress % 1 === 0) {
					const index = progress;
					for (let i = 0; i < numSlides; i++) {
						// $slideBackgroundVideos[i] && $slideBackgroundVideos[i][i === index ? 'play' : 'pause']();
						$slideContentVideos[i] && $slideContentVideos[i][i === index ? 'play' : 'pause']();
					}
				} else {
					const index1 = Math.floor(progress);
					const index2 = Math.ceil(progress);
					for (let i = 0; i < numSlides; i++) {
						// $slideBackgroundVideos[i] && $slideBackgroundVideos[i][i === index1 || i === index2 ? 'play' : 'pause']();
						$slideContentVideos[i] && $slideContentVideos[i][i === index1 || i === index2 ? 'play' : 'pause']();
					}
				}

				// visual.setProgress(animator.linearTween ? animator.linearProgress : progress);
				visual.setProgress(progress);
			}


			function onScroll (scrollTop) {
				// console.log('scroll in main.js', scrollTop);
			}

			function onMediaChange (media) {
				// console.log('mediachange in main.js', media);
			}

			function onResize (areaWidth, areaHeight) {
				// console.log('resize in main.js', areaWidth, areaHeight);
			}
		})();


		const visual = (() => {
			state.on('resize', onResize);
			
			const scene = new THREE.Scene();

			const frustumSize = 1;
			const aspect = areaWidth / areaHeight;
			const camera = new THREE.OrthographicCamera(-frustumSize * aspect / 2, frustumSize * aspect / 2, frustumSize / 2, -frustumSize / 2, 0.1, 99);
			camera.position.set(0, 0, 1);

			const renderer = new THREE.WebGLRenderer({ antialias: true });
			renderer.setClearColor(0xff6600);
			$slider.insertBefore(renderer.domElement, $slider.firstChild);

			// const imageWidth = 1920;
			// const imageHeight = 1080;
			const imageAspectRatio = 1920 / 1080;

			let requestToRender = true;
			let isVideoPlaying = false;

			let currentIndex = 0, nextIndex = 0;

			const textureLoader = new THREE.TextureLoader();

			const setTextureToConfigs = (texture, item) => {
				texture.minFilter = texture.magFilter = THREE.NearestFilter;
				loadedTextures[item[0]] = item[0] = texture;
			};

			const loadedTextures = {};
			const configs = [
				['visual-index-3.mp4', null, 0, 0, 0],
				// ['visual-index.mp4', null, 0, 0, 1],
				['visual-intro-bg.webp', null, 0, 0, 0],
				['visual-network.webp', null, 0, 0, 0],
				// ['nuri-launch.mp4', null, 0, 0, 0.26],
				// ['visual-space-kids.jpg', 'visual-space-kids-depth.jpg', 0.025, 0.025, 0],
				// ['visual-space-kids.jpg', 'visual-space-kids-depth.jpg', 0.025, 0.025, 0]
			].map((item, index) => {
				if (!loadedTextures[item[0]]) {
					let texture;
					if ((/mp4$/).test(item[0])) {
						texture = textureLoader.load(`${ imagePath }main/${ item[0].replace('.mp4', '.webp') }`, renderRequest);
						const $video = createVideoNode(`${ imagePath }main/${ item[0] }`);
						const videoTexture = new THREE.VideoTexture($video);
						$video.addEventListener('loadedmetadata', function () {
							if (index === currentIndex || index === nextIndex) {
								const onPlayCurrentVideo = () => {
									$video.removeEventListener('timeupdate', onPlayCurrentVideo);
									setTextureToConfigs(videoTexture, item);
									texture.dispose();
									renderRequest();
								};
								$video.addEventListener('timeupdate', onPlayCurrentVideo);
								$video.play();
							} else {
								setTextureToConfigs(videoTexture, item);
								texture.dispose();
							}
						});
					} else {
						texture = textureLoader.load(`${ imagePath }main/${ item[0] }`, renderRequest);
					}
					setTextureToConfigs(texture, item);
				} else {
					item[0] = loadedTextures[item[0]];
				}
				// depth image
				if (item[1]) {
					if (!loadedTextures[item[1]]) {
						item[1] = loadedTextures[item[1]] = textureLoader.load(`${ imagePath }main/${ item[1] }`);
						item[1].minFilter = item[1].magFilter = THREE.NearestFilter;
					} else {
						item[1] = loadedTextures[item[1]];
					}
				} else {
					item[1] = item[0];
				}
				return item;
			});

			const plane = new THREE.Mesh(
				new THREE.PlaneGeometry(1, 1),
				new THREE.ShaderMaterial({
					vertexShader: `
						varying vec2 v_uv;

						void main () {
							v_uv = uv;
							gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
						}
					`,
					fragmentShader: `
						#define PI 3.141592653589793

						uniform sampler2D u_image1;
						uniform sampler2D u_image1Depth;
						uniform sampler2D u_image2;
						uniform sampler2D u_image2Depth;
						uniform sampler2D u_imageDimmed;
						uniform vec2 u_uvRate;
						uniform vec2 u_offset;
						uniform vec2 u_offsetMultiplier1;
						uniform vec2 u_offsetMultiplier2;
						uniform vec2 u_dimmed;
						uniform float u_progress;
						uniform float u_wideness;

						varying vec2 v_uv;


						// https://github.com/yuichiroharai/glsl-y-repeat/blob/master/mirrored.glsl
						vec2 mirrored (vec2 uv) {
							vec2 m = mod(uv, 2.0);
							return mix(m, 2.0 - m, step(1.0, m));
						}

						// https://www.shadertoy.com/view/fdBfRw
						vec4 directionalBlur(sampler2D image, vec2 uv, vec2 direction, float progress, float amount) {
							vec4 color = vec4(0.0);
							uv.x += direction.x;
							for (int i = 1; i <= 32; i++) {
								color += texture2D(image, mirrored(uv) + float(i) * amount / 32.0 * direction);
							}
							return color / 32.0;
						}

						void main () {
							vec2 uv = v_uv;
							uv = (uv - 0.5) * u_uvRate + 0.5;

							float progress = fract(u_progress);

							float depth = mix(texture2D(u_image1Depth, uv).r - 0.5, texture2D(u_image2Depth, uv).r - 0.5, progress);
							vec2 offsetMultiplier = mix(u_offsetMultiplier1, u_offsetMultiplier2, progress);
							offsetMultiplier *= pow(abs(cos(progress * PI)), 2.0);
							uv = vec2(uv.x + depth * (u_offset.x * -1.0) * offsetMultiplier.x, uv.y + depth * (u_offset.y * 1.0) * offsetMultiplier.y);

							// float zoomin = cubicIn(min(1.0, progress / 0.4));
							// float zoomout = cubicIn(min(1.0, (1.0 - progress) / 0.4));
							float zoomin = min(1.0, progress / 0.4);
							float zoomout = min(1.0, (1.0 - progress) / 0.4);
							float zoom = zoomin * zoomout;

							uv.y = ((uv.y - 0.5) * (1.0 - zoom * 0.4) + 0.5);
							uv.y -= sin(uv.x * PI) * (cos(uv.y * PI) * (0.2 * zoom));

							// uv.x -= 0.5;
							// uv.x = pow(1.0 - zoom * 0.15, 1.0) * uv.x + 0.5;

							// float transition = cubicInOut(max(0.0, min(1.0, (progress - 0.1) / 0.8)));
							float transition = progress;
							float reversedTransition = 1.0 - transition;

							vec4 color1;
							vec4 color2;
							vec2 dimmedUv = v_uv;
							if (u_wideness > 0.0) {
								if (transition > 0.0) {
									color1 = directionalBlur(u_image1, uv, vec2(transition, 0.0), transition, u_wideness);
									color2 = directionalBlur(u_image2, uv, vec2(-reversedTransition, 0.0), reversedTransition, u_wideness);
								} else {
									color1 = texture2D(u_image1, mirrored(uv));
									color2 = vec4(0);
								}
								dimmedUv += vec2(transition, 0.0);
							} else {
								vec2 uv2 = (v_uv - 0.5) * u_uvRate + 0.5;
								if (transition > 0.0) {
									color1 = texture2D(u_image1, uv2);
									color2 = texture2D(u_image2, uv2);
								} else {
									color1 = texture2D(u_image1, uv2);
									color2 = vec4(0);
								}
							}

							vec4 dimmedColor = vec4(1.0 - texture2D(u_imageDimmed, dimmedUv).a);
							color1 = mix(color1, color1 * (dimmedColor * u_dimmed.x), u_dimmed.x);
							dimmedColor = vec4(1.0 - texture2D(u_imageDimmed, fract(dimmedUv)).a);
							color2 = mix(color2, color2 * (dimmedColor * u_dimmed.y), u_dimmed.y);

							gl_FragColor = mix(color1, color2, transition);
						}
					`,
					uniforms: {
						u_image1: { value: null },
						u_image1Depth: { value: null },
						u_image2: { value: null },
						u_image2Depth: { value: null },
						u_imageDimmed: { value: textureLoader.load(`${ imagePath }main/dimmed-s.png`, renderRequest) },
						u_uvRate: { value: new THREE.Vector2() },
						u_offset: { value: new THREE.Vector2() },
						u_offsetMultiplier1: { value: new THREE.Vector2() },
						u_offsetMultiplier2: { value: new THREE.Vector2() },
						u_dimmed: { value: new THREE.Vector2() },
						u_progress: { value: defaultIndex },
						u_wideness: { value: 0 }
					}
				})
			);
			const uniforms = plane.material.uniforms;

			scene.add(plane);

			const offset = { x: 0, y: 0, tween: null };
			document.addEventListener('mousemove', (e) => {
				const x = (e.clientX - areaWidth / 2) / (areaWidth / 2);
				const y = (e.clientY - areaHeight / 2) / (areaHeight / 2);

				offset.tween && offset.tween.kill();
				offset.tween = gsap.to(offset, 1.5, { x: x, y: y, ease: 'expo.out', onUpdate: renderRequest });
			});

			if (window._DEBUG) {
				_DEBUG.gui.add(uniforms.u_progress, 'value', 0, numSlides - 1, 0.0001).name('transition').listen().onChange(renderRequest);
				_DEBUG.gui.add({ prev: () => {
					gsap.to(uniforms.u_progress, duration, { value: Math.max(0, uniforms.u_progress.value - 1), ease: 'linear', onUpdate: renderRequest });
				} }, 'prev');
				_DEBUG.gui.add({ next: () => {
					gsap.to(uniforms.u_progress, duration, { value: Math.min(numSlides - 1, uniforms.u_progress.value + 1), ease: 'linear', onUpdate: renderRequest });
				} }, 'next');
			}


			gsap.ticker.add(animate);


			function onResize (areaWidth, areaHeight) {
				const aspect = areaWidth / areaHeight;
				camera.left = -frustumSize * aspect / 2;
				camera.right = frustumSize * aspect / 2;
				camera.top = frustumSize / 2;
				camera.bottom = -frustumSize / 2;
				camera.updateProjectionMatrix();

				plane.scale.set(aspect, 1);
				if (imageAspectRatio > aspect) {
					uniforms.u_uvRate.value.set(aspect / imageAspectRatio, 1);
				} else {
					uniforms.u_uvRate.value.set(1, (areaHeight / areaWidth) * imageAspectRatio);
				}

				uniforms.u_wideness.value = state.states.media === 'mobile' ? 0 : Math.min(0.5, Math.max(0.1, areaWidth / 3840));

				renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
				renderer.setSize(areaWidth, areaHeight);

				renderRequest();
			}

			function renderRequest () {
				requestToRender = true;
			}

			function playIfVideoTexture (texture) {
				if (texture.isVideoTexture) {
					if (texture.source.data.paused) {
						texture.source.data.play().then(() => onVideoPlay(texture.source.data));
					}
					return true;
				}
				return false;
			}

			function onVideoPlay ($video) {
				$video.dataset.pausable = '1';
			}

			function animate (time, deltaTime) {
				if (requestToRender) {
					currentIndex = Math.max(0, Math.min(numSlides - 1, Math.floor(uniforms.u_progress.value)));
					nextIndex = Math.max(0, Math.min(numSlides - 1, Math.ceil(uniforms.u_progress.value)));

					uniforms.u_image1.value = configs[currentIndex][0];
					uniforms.u_image1Depth.value = configs[currentIndex][1];
					uniforms.u_image2.value = configs[nextIndex][0];
					uniforms.u_image2Depth.value = configs[nextIndex][1];

					isVideoPlaying = false;
					isVideoPlaying = playIfVideoTexture(configs[currentIndex][0]);
					isVideoPlaying = playIfVideoTexture(configs[nextIndex][0]);

					uniforms.u_offset.value.set(offset.x, offset.y);
					uniforms.u_offsetMultiplier1.value.set(configs[currentIndex][2], configs[currentIndex][3]);
					uniforms.u_offsetMultiplier2.value.set(configs[nextIndex][2], configs[nextIndex][3]);
					uniforms.u_dimmed.value.set(configs[currentIndex][4], configs[nextIndex][4]);

					renderer.render(scene, camera);
					
					if (!isVideoPlaying) {
						requestToRender = false;
					}
				}
			}

			return {
				setProgress: (value) => {
					if (value % 1 === 0) {
						for (let i = 0; i < numSlides; i++) {
							const config = configs[i];
							if (i !== value && config[0].isVideoTexture) {
								const $video = config[0].source.data;
								if (!$video.paused && $video.dataset.pausable === '1') {
									$video.pause();
									$video.currentTime = 0;
									$video.dataset.pausable = '';
								}
							}
						}
					}
					uniforms.u_progress.value = value;
					renderRequest();
				}
			}
		})();
	})();
});
















