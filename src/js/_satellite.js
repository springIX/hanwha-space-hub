import gsap from 'gsap';
import lottie from 'lottie-web';

import * as state from './state';
import { areaWidth, areaHeight, imagePath } from './common';

state.on('enter', () => {
  document.querySelector('main.satellite') &&
    (() => {
      const $main = document.querySelector('main.satellite');
      const $earthWrap = $main.querySelector('.earth-wrap');
      const $earth = $main.querySelector('.earth');
      const $earthVideo = $earth.querySelector('video');
      const $earthVisualAll = $main.querySelectorAll('[class*="earth-visual-"]');
      const $stars = $main.querySelector('.stars');

      const timelineBlank = { value: 0 };

      // earth
      let earthSize;
      // tablet
      let isTablet = areaWidth > 1023 ? false : true;

      // 지구본 영역을 위한 sticky 엘리먼트 height, marginBottom 셋팅
      state.on('resize', (areaWidth, areaHeight) => {
        const contentHeight = $main.offsetHeight;
        $earthWrap.style.cssText = '';
        gsap.set($earthWrap, { height: contentHeight, marginBottom: -contentHeight });

        earthSize = $earth.offsetHeight;

        isTablet = areaWidth > 1023 ? false : true;
      });

      // $target 영역에 맞는 x, y, scale 을 구함
      function getEarthPositionAndScale ($target) {
        const targetRect = $target.getBoundingClientRect();
        const parentRect = $target.parentNode.getBoundingClientRect();
        return {
          x: targetRect.left + targetRect.width / 2,
          y: (targetRect.top - parentRect.top) + targetRect.height / 2,
          scale: Math.max(targetRect.width / earthSize, targetRect.height / earthSize)
        };
      }

      // gsap style reset
      function resetNodes($target) {
        [].forEach.call($target.querySelectorAll('*'), ($node) => {
          $node._gsap && gsap.set($node, { clearProps: true });
        });
      }

      // earth play
      function playEarthVideo () {
        if ($earthVideo.paused) {
          $earthVideo.play();
        }
      }

      // paly video
      function controlVideo (video, request) {
        const isPlaying = video.currentTime > 0 && !video.paused && !video.ended && video.readyState > video.HAVE_CURRENT_DATA;
        if ( request == 'play' ) {
          !isPlaying && video.play();
        } else if ( request == 'pause' ) {
          isPlaying && video.pause();
        } else if ( request == 'stop' ) {
          isPlaying && video.pause();
          video.currentTime = 0;
        }
      }

      // create sequence
      const createSequence = function ( array, count, path ) {
        let $image;
        let num;

        for (var i = 0; i < count; i++) {
          $image = new Image();
          num = String(i).length < 3 ? 
            new Array(3 - String(i).length + 1).join("0") + i :
            String(i);
          $image.src = `${imagePath}satellite/${path}_${num}.webp`;

          array.push($image);

          $image.onerror = function (e) {
            array = array.filter(function (data) {
              return data !== e.target;
            });
            count = array.length;
          }
        }
      }
      
      // reset lottie
      function resetLottie (target) {
        target.goToAndStop(0);
        target._resetted = true;
      }

      playEarthVideo();

      // vision
      (() => {
        const $vision = $main.querySelector('.vision');
        const $textsChild = $vision.querySelector('.texts').children;
        const $earthVisuals = $vision.querySelectorAll('[class*="earth-visual-"]');

        let timeline, visionHeight;

        // action
        state.on('scroll', (scrollTop) => {
          const rect = $vision.getBoundingClientRect();
          if (rect.top < areaHeight && rect.bottom > 0) {
            const progress = -rect.top / visionHeight;
            if ( progress > 1 || progress == 0 ) timeline.progress(1); // 다음 섹션에서 fromTo를 지정하면서 변경되는 첫 프레임을 되돌림 ++ 스크롤 진행 중 onupdate, oncomplete 가 계속 도는 현상이 있어 if 문 처리
            timeline.progress(progress);
          } 
        });
        state.on('resize', (areaWidth, areaHeight) => {
          visionHeight = $vision.offsetHeight - areaHeight;
          createTimeline();
        });

        // event
        const createTimeline = function () {
          timeline && timeline.kill();
          resetNodes($vision);
          timeline = gsap.timeline({ paused: true });

          timeline.fromTo( 
            $earth, 
            getEarthPositionAndScale($earthVisuals[0]), 
            { ...getEarthPositionAndScale($earthVisuals[0]), duration: 1, ease: 'cubic.inOut' }, 
            0
          );
          timeline.fromTo($textsChild[0], { y: 0, opacity: 1 }, { y: -100, opacity: 0, duration: 1, ease: 'cubic.in' }, 0);
          for (let i = 1; i < $textsChild.length; i++) {
            const item = $textsChild[i];
            
            if ( item.querySelector('span') ) {
              for (let j = 0; j < item.children.length; j++) {
                const span = item.children[j];
                if ( span.tagName == 'SPAN' ) {
                  timeline.fromTo(span, { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' });
                }
              }
              timeline.to(item, { y: -100, opacity: 0, duration: 1, ease: 'cubic.in' }, `${i}-last`);
            } else {
              timeline.fromTo(item, { y: "100%", opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' });
              timeline.to(item, { y: -100, opacity: 0, duration: 1, ease: 'cubic.in' }, `${i}-last`);
            }
          }
        }
      })();

      // space-internet
      (() => {
        const $spaceInternet = $main.querySelector('.space-internet');

        // internet
        (() => {
          const $internet = $spaceInternet.querySelector('.internet');
          const $sticky = $internet.querySelector('.sticky');
          const $contents = $internet.querySelector('.contents');
          const $texts = $internet.querySelector('.texts');
          const $images = $internet.querySelector('.images');
          const $earthVisuals = $internet.querySelectorAll('[class*="earth-visual-"]');

          let timeline, internetHeight;

          state.on('scroll', (scrollTop) => {
            const rect = $internet.getBoundingClientRect();
            if (rect.top < areaHeight && rect.bottom > 0) {
              const progress = -rect.top / internetHeight;
              if ( progress > 1 || progress < 0 ) timeline.progress(1);
              if ( progress < 0 ) {
                $earthVisuals[0].classList.contains('on') && $earthVisuals[0].classList.remove('on');
              } 
              timeline.progress(progress);
            } else {
              $earthVisuals[0].classList.contains('on') && $earthVisuals[0].classList.remove('on');
              controlVideo($earthVisuals[1].querySelector('.in video'), 'pause');
              controlVideo($earthVisuals[1].querySelector('.out video'), 'pause');
            }
          });
          state.on('mediachange', (media) => {
          });
          state.on('resize', (areaWidth, areaHeight) => {
            internetHeight = $internet.offsetHeight - areaHeight;

            if ( isTablet ) {
              createTimelineMobile();
            } else {
              createTimelineWeb();
            }
          });

          const createTimelineMobile = function () {
            const cssScale = { value1: 0, value2: 0 };

            timeline && timeline.kill();
            // resetNodes($internet);
            
            const version = isTablet ? 'mobile' : 'web';
            if ( timeline && timeline.version !== version ) {
              for (let i = 0; i < timeline.getChildren().length; i++) {
                const elem = timeline.getChildren()[i];
                if ( elem._targets[0].tagName ) {
                  gsap.set(elem._targets[0], { clearProps: true });
                }
              }
            }
            
            timeline = gsap.timeline({ paused: true });
            timeline.version = 'mobile';

            // scene1 - 지구 확대 우주 인터넷
            timeline.fromTo($stars, { scale: 1 }, { scale: 1.3, y: -areaHeight*0.2, duration: 2, ease: 'Power1.easeOut' }, 'scene1');
            timeline.fromTo( 
              $earth, 
              getEarthPositionAndScale($earthVisualAll[0]), 
              { ...getEarthPositionAndScale($earthVisuals[0]), duration: 2, ease: 'Power1.easeOut' }, 
              'scene1'
            );
            timeline.fromTo($sticky, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'Power1.easeOut' }, 'scene1');
            timeline.fromTo($texts.children[0], { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'scene1');
            timeline.fromTo($texts.children[1], { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 1.1, ease: 'Power1.easeOut' }, 'scene1');
            timeline.fromTo($texts.children[2], { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 1.2, ease: 'Power1.easeOut' }, 'scene1');
            timeline.fromTo($images, { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 1.3, ease: 'Power1.easeOut' }, 'scene1');
            timeline.fromTo($earthVisuals[0].querySelector('img'), { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 1, delay: 1.5, ease: 'Power1.easeOut',
              onUpdate: () => { !$earthVisuals[0].classList.contains('on') && $earthVisuals[0].classList.add('on'); }
            }, 'scene1');

            // scene2 - contents 가 areaheight 을 넘어가면 스크롤
            const scrollDuration = $contents.offsetHeight / areaHeight;
            const contentsScroll = $contents.offsetHeight > areaHeight ? $contents.offsetHeight : areaHeight;
            timeline.fromTo($contents, { y: 0 }, { y: -contentsScroll, duration: 2, ease: 'Power0.easeNone' }, 'scene2');
            // -- 지구 줌아웃
            timeline.to( $stars, { scale: 1, y: 0, duration: 1, ease: 'Power2.easeOut' }, 'scene2');
            timeline.to( $earth, { ...getEarthPositionAndScale($earthVisuals[1]), duration: 1, ease: 'Power2.easeOut' }, 'scene2');
            timeline.to( $earthVisuals[0].querySelector('img'), { opacity: 0, duration: 0.5, ease: 'Power1.easeOut', 
              onUpdate: () => {  !$earthVisuals[0].classList.contains('on') && $earthVisuals[0].classList.add('on'); },
              onComplete: () => { $earthVisuals[0].classList.contains('on') && $earthVisuals[0].classList.remove('on');  }
            }, 'scene2');
            // -- 지구 visuals 1
            timeline.fromTo( $earthVisuals[1], { opacity: 0 }, { opacity: 1, duration: 1, delay: 0.75, ease: 'Power1.easeOut' }, 'scene2');
            timeline.fromTo( cssScale, { value1: 1 }, { value1: 1.6, duration: 1, delay: 0.75, ease: 'Power1.easeOut',
              onUpdate: () => { $earthVisuals[1].style.setProperty('--scale-1', cssScale.value1) }
            }, 'scene2');
            timeline.fromTo( cssScale, { value2: 1 }, { value2: 2.6, duration: 1, delay: 0.75, ease: 'Power1.easeOut',
              onUpdate: () => { 
                $earthVisuals[1].style.setProperty('--scale-2', cssScale.value2);

                if ( cssScale.value2 > 1 ) {
                  controlVideo($earthVisuals[1].querySelector('.in video'), 'play');
                  controlVideo($earthVisuals[1].querySelector('.out video'), 'play');
                } else {
                  controlVideo($earthVisuals[1].querySelector('.in video'), 'pause');
                  controlVideo($earthVisuals[1].querySelector('.out video'), 'pause');
                }
              }
            }, 'scene2');

            // sceneout
            timeline.to( $earthVisuals[1], { opacity: 0, duration: 0.5, ease: 'Power1.easeIn' }, 'sceneout');
            timeline.to( cssScale, { value1: 2.6, duration: 0.5, ease: 'Power1.easeIn',
              onUpdate: () => { $earthVisuals[1].style.setProperty('--scale-1', cssScale.value1) }
            }, 'sceneout');
            timeline.to( cssScale, { value2: 3.6, duration: 0.5, ease: 'Power1.easeIn',
              onUpdate: () => { $earthVisuals[1].style.setProperty('--scale-2', cssScale.value2) }
            }, 'sceneout');
            timeline.to( $sticky, { opacity: 0, duration: 0.5, ease: 'Power1.easeIn' }, 'sceneout');
          }

          const createTimelineWeb = function () {
            const cssScale = { value1: 0, value2: 0 }

            timeline && timeline.kill();
            // resetNodes($internet);

            const version = isTablet ? 'mobile' : 'web';
            if ( timeline && timeline.version !== version ) {
              for (let i = 0; i < timeline.getChildren().length; i++) {
                const elem = timeline.getChildren()[i];
                if ( elem._targets[0].tagName ) {
                  gsap.set(elem._targets[0], { clearProps: true });
                }
              }
            }
            timeline = gsap.timeline({ paused: true });
            timeline.version = 'web';

            // scene1 - 지구 확대 우주 인터넷
            timeline.fromTo($stars, { scale: 1 }, { scale: 1.3, y: -areaHeight*0.2, duration: 2, ease: 'Power1.easeOut' }, 'scene1');
            timeline.fromTo( 
              $earth, 
              getEarthPositionAndScale($earthVisualAll[0]), 
              { ...getEarthPositionAndScale($earthVisuals[0]), duration: 2, ease: 'Power1.easeOut' }, 
              'scene1'
            );
            timeline.fromTo($texts, { x: 312, opacity: 0 }, { opacity: 1, duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'scene1');
            timeline.fromTo($texts.children[0], { y: 100 }, { y: 0, duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'scene1');
            timeline.fromTo($texts.children[1], { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 1.1, ease: 'Power1.easeOut' }, 'scene1');
            timeline.fromTo($texts.children[2], { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 1.2, ease: 'Power1.easeOut' }, 'scene1');
            timeline.fromTo($earthVisuals[0].querySelector('img'), { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 1, delay: 1.2, ease: 'Power1.easeOut',
              onUpdate: () => { !$earthVisuals[0].classList.contains('on') && $earthVisuals[0].classList.add('on'); }
            }, 'scene1');

            // scene2 -- 지구 줌아웃
            timeline.to($stars, { scale: 1, y: 0, duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'scene2');
            timeline.to($earthVisuals[0].querySelector('img'), { opacity: 0, duration: 0.5, delay: 1, ease: 'Power1.easeOut', 
              onUpdate: () => {  
                !$earthVisuals[0].classList.contains('on') && $earthVisuals[0].classList.add('on');

                controlVideo($earthVisuals[1].querySelector('.in video'), 'pause');
                controlVideo($earthVisuals[1].querySelector('.out video'), 'pause');
              },
              onComplete: () => { $earthVisuals[0].classList.contains('on') && $earthVisuals[0].classList.remove('on');  }
            }, 'scene2');
            timeline.to($texts, { x: 0, duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'scene2');
            timeline.fromTo($images, { opacity: 0 }, { opacity: 1, duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'scene2');
            timeline.to( $earth, { ...getEarthPositionAndScale($earthVisuals[1]), duration: 1, delay: 1, ease: 'cubic.inOut' }, 'scene2');

            // scene3
            timeline.fromTo($earthVisuals[1], { opacity: 0 }, { opacity: 1, duration: 1, ease: 'Power1.easeOut' }, 'scene3');
            timeline.fromTo(cssScale, { value1: 1 }, { value1: 1.6, duration: 1, ease: 'Power1.easeOut',
              onUpdate: () => { $earthVisuals[1].style.setProperty('--scale-1', cssScale.value1) }
            }, 'scene3');
            timeline.fromTo(cssScale, { value2: 1 }, { value2: 2.6, duration: 1, ease: 'Power1.easeOut',
              onUpdate: () => { 
                $earthVisuals[1].style.setProperty('--scale-2', cssScale.value2);

                controlVideo($earthVisuals[1].querySelector('.in video'), 'play');
                controlVideo($earthVisuals[1].querySelector('.out video'), 'play');
              },
            }, 'scene3');

            // scene3-blank
            timeline.to(timelineBlank, { value: 1, duration: 1,
              onUpdate: () => { 
                controlVideo($earthVisuals[1].querySelector('.in video'), 'play');
                controlVideo($earthVisuals[1].querySelector('.out video'), 'play');
              },
              onComplete: () => {
                controlVideo($earthVisuals[1].querySelector('.in video'), 'pause');
                controlVideo($earthVisuals[1].querySelector('.out video'), 'pause');
              }
            }, 'scene3-blank');
            

            // sceneout
            timeline.to($texts, { opacity: 0, duration: 1, ease: 'Power1.easeIn' }, 'sceneout');
            timeline.to($images, { opacity: 0, y: -200, duration: 1, ease: 'Power1.easeIn' }, 'sceneout');
            timeline.to($earthVisuals[1], { opacity: 0, duration: 1, ease: 'Power1.easeIn' }, 'sceneout');
            timeline.to(cssScale, { value1: 2.6, duration: 1, ease: 'Power1.easeIn',
              onUpdate: () => { $earthVisuals[1].style.setProperty('--scale-1', cssScale.value1) }
            }, 'sceneout');
            timeline.to(cssScale, { value2: 3.6, duration: 1, ease: 'Power1.easeIn',
              onUpdate: () => { $earthVisuals[1].style.setProperty('--scale-2', cssScale.value2) }
            }, 'sceneout');
          }
        })();

        // communication
        (() => {
          const $communication = $spaceInternet.querySelector('.communication');
          const $textses = $communication.querySelectorAll('.texts');
          const $earthVisuals = $communication.querySelectorAll('[class*="earth-visual-"]');
          const $satsLeo = $earthVisuals[0].querySelector('.sats-leo');
          const $satsLeoIn = $earthVisuals[0].querySelector('.sats-leo-in');

          let lottieOptions, lottieInternet1, lottieInternet2;
          let timeline, communicationHeight;

          state.on('scroll', (scrollTop) => {
            const rect = $communication.getBoundingClientRect();
            if (rect.top < areaHeight && rect.bottom > 0) {
              const progress = -rect.top / communicationHeight;
              if ( progress > 1 || progress < 0 ) timeline.progress(1);
              if ( progress < 0 ) {
                $satsLeo.classList.contains('change1') && $satsLeo.classList.remove('change1'); 
                $earthVisuals[0].classList.contains('on') && $earthVisuals[0].classList.remove('on');
              }  
              timeline.progress(progress);
            } else {
              if ( !$earthVisuals[0].querySelector('video').paused || !$earthVisuals[1].querySelector('video').paused ) {
                controlVideo($earthVisuals[0].querySelector('video'), 'pause');
                controlVideo($earthVisuals[1].querySelector('video'), 'pause');

                lottieInternet1 && resetLottie(lottieInternet1);
                lottieInternet2 && resetLottie(lottieInternet2);

                $satsLeo.classList.contains('change1') && $satsLeo.classList.remove('change1'); 
                $earthVisuals[0].classList.contains('on') && $earthVisuals[0].classList.remove('on');
              }
            }
          });
          state.on('resize', (areaWidth, areaHeight) => {
            communicationHeight = $communication.offsetHeight - areaHeight;
            !isTablet && createLottie();
            createTimeline();
          });

          const createLottie = function () {
            if ( lottieInternet1 ) return;

            lottieOptions = { renderer: 'svg', loop: true, autoplay: false };
            lottieInternet1 = lottie.loadAnimation({
              container: $satsLeo.querySelector('.leo .internet'),
              path: `${ imagePath }satellite/roadmap-sats-internet.json`,
              ...lottieOptions,
            });
            lottieInternet2 = lottie.loadAnimation({
              container: $earthVisuals[0].querySelector('.sats-other .antena .internet'),
              path: `${ imagePath }satellite/roadmap-sats-internet.json`,
              ...lottieOptions,
            });
          }

          const createTimeline = function () {
            timeline && timeline.kill();
            // resetNodes($communication);
            const version = isTablet ? 'mobile' : 'web';
            if ( timeline && timeline.version !== version ) {
              for (let i = 0; i < timeline.getChildren().length; i++) {
                const elem = timeline.getChildren()[i];
                if ( elem._targets[0].tagName ) {
                  gsap.set(elem._targets[0], { clearProps: true });
                }
              }
            }
            timeline = gsap.timeline({ paused: true });
            timeline.version = version;

            const toEarthVis0 = getEarthPositionAndScale($earthVisuals[0]);
            const toEarthVis1 = getEarthPositionAndScale($earthVisuals[1]);
            const toEarthVis2 = getEarthPositionAndScale($earthVisualAll[5]);
            const leoRotateProgress = { value: 0 };
            
            // scene1
            timeline.fromTo( $stars, { scale: 1, y: 0 }, { scale: 0.8, x: -100, duration: 2, ease: 'cubic.inOut' }, 'scene1');
            timeline.fromTo( 
              $earth, 
              getEarthPositionAndScale($earthVisualAll[2]), 
              { ...toEarthVis0, duration: 2, ease: 'cubic.inOut' }, 
              'scene1'
            );
            timeline.fromTo( $textses[0], { opacity: 0, y: '100%' }, { opacity: 1, y: 0, duration: 1, delay: 1, ease: 'Power1.easeOut', 
              onUpdate: () => { $earthVisuals[0].classList.contains('on') && $earthVisuals[0].classList.remove('on'); }
            }, 'scene1');

            // scene2 visual 1 등장
            timeline.fromTo( $earthVisuals[0], { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'Power1.easeOut',  
              onUpdate: () => { 
                !$earthVisuals[0].classList.contains('on') && $earthVisuals[0].classList.add('on');
                controlVideo($earthVisuals[0].querySelector('video'), 'play');
              }, 
            }, 'scene2');

            // scene2-blank
            timeline.to( $earthVisuals[0], { opacity: 1, duration: 1, 
              onUpdate: () => { 
                controlVideo($earthVisuals[0].querySelector('video'), 'play');

                if ( !isTablet ) {
                  if (lottieInternet1.isPaused || lottieInternet2.isPaused) {
                    lottieInternet1._resetted = false;
                    lottieInternet1.play();
  
                    lottieInternet2._resetted = false;
                    lottieInternet2.play();
                  }
                }

                $earthVisuals[0].children[2].style = ''; 
              }
            }, 'scene2-blank');

            
            // scene3 earthvis1 -> 2
            timeline.to( $earthVisuals[0].children[0], { opacity: 0, duration: 1, delay: 0, ease: 'Power1.easeOut' }, 'scene3');
            timeline.to( $earthVisuals[0].children[2], { opacity: 0, duration: 1, delay: 0, ease: 'Power1.easeOut' }, 'scene3');
            timeline.fromTo(leoRotateProgress, { value: 0 }, { value: 1, duration: 1, delay: 0, ease: 'Power1.easeOut',
              onUpdate: () => { $satsLeo.style.setProperty('--progress', leoRotateProgress.value) }
            }, 'scene3');
            timeline.fromTo( $satsLeoIn, {
              width: '100%',
              height: '100%',
            },{
              width: earthSize * toEarthVis1.scale,
              height: earthSize * toEarthVis1.scale,
              duration: 1, delay: 0, ease: 'cubic.inOut',
            }, 'scene3');
            timeline.fromTo( $satsLeo, { x: 0, y: 0, rotate: 0 },{ 
              x: toEarthVis1.x - toEarthVis0.x, 
              y: toEarthVis1.y - toEarthVis0.y, 
              rotate: -75,
              duration: 1, delay: 0, ease: 'cubic.inOut',
              onUpdate: () => { 
                $earthVisuals[0].children[2].style.transition = `none`; 
                controlVideo($earthVisuals[0].querySelector('video'), 'pause');
                // controlVideo($earthVisuals[1].querySelector('video'), 'pause');

                if ( $earthVisuals[1].querySelector('video').currentTime !== 1 ) {
                  $earthVisuals[1].querySelector('video').play();
                  $earthVisuals[1].querySelector('video').currentTime = 1;
                  $earthVisuals[1].querySelector('video').pause();
                }

                if ( !isTablet ) {
                  if (lottieInternet1.isPaused) {
                    lottieInternet1._resetted = false;
                    lottieInternet1.play();
                  }
                }

                $satsLeo.classList.contains('change1') && $satsLeo.classList.remove('change1'); 
              }, 
            }, 'scene3');
            timeline.to( $earth, { ...toEarthVis1, duration: 1, delay: 0, ease: 'cubic.inOut' }, 'scene3');
            timeline.to( $textses[0], { opacity: 0, y: -100, duration: 0.5, delay: 0, ease: 'Power1.easeOut' }, 'scene3');
            timeline.fromTo( $textses[1].querySelector('.subtitle'), { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.5, ease: 'Power1.easeOut' }, 'scene3');
            timeline.fromTo( $textses[1].querySelector('.text:nth-child(1)'), { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.6, ease: 'Power1.easeOut' }, 'scene3');
            timeline.fromTo( $textses[1].querySelector('.text:nth-child(2)'), { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.7, ease: 'Power1.easeOut' }, 'scene3');
            timeline.fromTo( $earthVisuals[1].children[0], { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'scene3');

            // sceen3-blank
            timeline.fromTo( $textses[1], { opacity: 1, x: 0, y: 0 }, { opacity: 1, duration: 1, 
              onUpdate: () => { 
                !$satsLeo.classList.contains('change1') && $satsLeo.classList.add('change1'); 
                controlVideo($earthVisuals[1].querySelector('video'), 'play'); 

                if ( !isTablet ) {
                  if (lottieInternet1.isPaused || lottieInternet2.isPaused) {
                    lottieInternet1._resetted = false;
                    lottieInternet1.play();
  
                    lottieInternet2._resetted = false;
                    lottieInternet2.play();
                  }
                }
              }
            }, 'scene3-blank');

            // scene4
            timeline.to( $earthVisuals[1].children[0], { opacity: 0, duration: 1, ease: 'Power1.easeOut' }, 'scene4');
            timeline.fromTo( $satsLeoIn.querySelector('.internet'), { opacity: 1 }, { opacity: 0, duration: 1, ease: 'Power1.easeOut' }, 'scene4');
            timeline.fromTo( $satsLeo, { scale: 1, opacity: 1 }, { 
              x: toEarthVis2.x - toEarthVis0.x, 
              y: toEarthVis2.y - toEarthVis0.y, 
              scale: (earthSize*toEarthVis2.scale) / ((earthSize*toEarthVis1.scale)*1.77),
              opacity: 0.2,
              delay: 0.5,
              duration: 1, ease: 'cubic.inOut',
              onUpdate: () => { 
                $satsLeo.classList.contains('end') && $satsLeo.classList.remove('end');
                $satsLeo.style.transition = `opacity 0s`;

                controlVideo($earthVisuals[1].querySelector('video'), 'pause');

                lottieInternet1 && resetLottie(lottieInternet1);
                lottieInternet2 && resetLottie(lottieInternet2);
              },
              onComplete: () => { 
                !$satsLeo.classList.contains('end') && $satsLeo.classList.add('end');
              }
            }, 'scene4');
            timeline.to( $earth, { ...toEarthVis2, delay: 0.5, duration: 1, ease: 'cubic.inOut' }, 'scene4');
            timeline.to( $textses[1], { opacity: 0, x: !isTablet ? 100 : 0, delay: 0.5, duration: 1, ease: 'Power1.easeOut' }, 'scene4');
            timeline.to( $stars, { scale: 1.2, x: 0, delay: 0.5, duration: 1, ease: 'Power1.easeOut' }, 'scene4');
          }
        })();

        // payload
        (() => {
          const $payload = $spaceInternet.querySelector('.payload');
          const $earthVisuals = $payload.querySelectorAll('[class*="earth-visual-"]');
          const $earthLineVisual =$payload.querySelector('.earth-line-visual-1');
          const $intro = $payload.querySelector('.intro');
          const $lists = $payload.querySelector('.lists');
          const $listsNavs = $payload.querySelectorAll('.lists-nav li');
          const $details = $payload.querySelector('.details');
          const $detailItems = $payload.querySelectorAll('.details .item');
          const $detailNavs = $payload.querySelectorAll('.detail-nav li');

          let timeline, payloadHeight;

          const $earthIslCanvas = $earthVisuals[1].querySelector('.isl canvas');
          const contextIsl = $earthIslCanvas.getContext('2d');
          const $earthEsaCanvas = $earthVisuals[1].querySelector('.esa canvas');
          const contextEsa = $earthEsaCanvas.getContext('2d');

          const sequenceImages = { isl: [], esa: [] };
          const sequenceCount = { isl: 71, esa: 151 };
          const sequenceProgress = { isl: 0, esa: 0 }

          state.on('scroll', (scrollTop) => {
            const rect = $payload.getBoundingClientRect();
            if (rect.top < areaHeight && rect.bottom > 0) {
              const progress = -rect.top / payloadHeight;

              if ( progress < 1 ) {
                timeline.progress(progress);
              } else if ( progress > 1 && $earthVisuals[1].querySelector('.bg').style.opacity !== 0 ) {
                $earthVisuals[1].querySelector('.bg').style.opacity = 0;
              }
            } else {
              $intro.classList.contains('on') && $intro.classList.remove('on');

              controlVideo($earthLineVisual.querySelector('video'), 'pause');
            }
          });
          state.on('mediachange', (media) => {
          });
          state.on('resize', (areaWidth, areaHeight) => {
            payloadHeight = $payload.offsetHeight - areaHeight;
            
            if ( !isTablet ) {
              sequenceImages.isl.length == 0 && createSequence(sequenceImages.isl, sequenceCount.isl, 'space-internet-payload-earth-visual-2-isl/isl');
              sequenceImages.esa.length == 0 && createSequence(sequenceImages.esa, sequenceCount.esa, 'space-internet-payload-earth-visual-2-esa/esa');

              createTimelineWeb();
            } else {
              createTimelineMobile();
            }
          });

          const createTimelineWeb = function () {
            $details.style.paddingTop = ''; 

            timeline && timeline.kill();
            const version = isTablet ? 'mobile' : 'web';
            if ( timeline && timeline.version !== version ) {
              for (let i = 0; i < timeline.getChildren().length; i++) {
                const elem = timeline.getChildren()[i];
                if ( elem._targets[0].tagName ) {
                  gsap.set(elem._targets[0], { clearProps: true });
                }
              }
            }
            timeline = gsap.timeline({ paused: true });
            timeline.version = version;
            
            // 0
            timeline.fromTo( $intro.querySelector('.eyebrow'),           { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'Power1.easeOut' }, 'scene1');
            timeline.fromTo( $intro.querySelector('.title'),             { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.1, ease: 'Power1.easeOut' }, 'scene1');
            timeline.fromTo( $intro.querySelector('.text:nth-child(1)'), { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.2, ease: 'Power1.easeOut' }, 'scene1');
            timeline.fromTo( $intro.querySelector('.text:nth-child(2)'), { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.3, ease: 'Power1.easeOut' }, 'scene1');
            timeline.fromTo( $intro.querySelector('.overview'),          { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.4, ease: 'Power1.easeOut' }, 'scene1');
            timeline.fromTo( $earthVisuals[0], { opacity: 0 }, { opacity: 1, duration: 1, ease: 'Power1.easeOut' }, 'scene1');
            timeline.fromTo( $earthLineVisual, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'Power1.easeOut', 
              onUpdate: () => { 
                !$intro.classList.contains('on') && $intro.classList.add('on');

                $lists.querySelector('.lists-nav li.on') && $lists.querySelector('.lists-nav li.on').classList.remove('on');
                $lists.querySelector('.detail-nav li.on') && $lists.querySelector('.detail-nav li.on').classList.remove('on');

                controlVideo($earthLineVisual.querySelector('video'), 'play');
              }
            }, 'scene1');

            // 1 -- 지구 earth2로 이동, isl 나오고
            timeline.to( $earthVisuals[0], { opacity: 0, duration: 0.5, delay: 1, ease: 'Power1.easeIn' }, 'scene2');
            timeline.to( $earthLineVisual, { opacity: 0, duration: 0.5, delay: 1, ease: 'Power1.easeIn' }, 'scene2');
            timeline.fromTo( $intro, { opacity: 1, x: 0 }, { opacity: 0, x: -100, duration: 0.5, delay: 1, ease: 'Power1.easeIn' }, 'scene2');
            timeline.fromTo( 
              $earth, 
              getEarthPositionAndScale($earthVisuals[0]), 
              { ...getEarthPositionAndScale($earthVisuals[1]), duration: 1, delay: 1, ease: 'cubic.inOut' }, 
              'scene2'
            );
            timeline.fromTo( $stars, { scale: 1.2, x: 0 }, { scale: 1, x: 0, duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'scene2');
            timeline.fromTo( $lists, { opacity: 0 }, { opacity: 1, duration: 1, delay: 1.5, ease: 'Power1.easeOut' }, 'scene2');
            timeline.fromTo( $detailItems[0], { opacity: 0 }, { opacity: 1, duration: 1, delay: 1.5, ease: 'Power1.easeOut' }, 'scene2');
            timeline.fromTo( $detailItems[0].querySelector('.subtitle'), { y: 100, }, { y: 0, duration: 1, delay: 1.5, ease: 'Power1.easeOut' }, 'scene2');
            timeline.fromTo( $detailItems[0].querySelector('.text'), { y: 100, }, { y: 0, duration: 1, delay: 1.6, ease: 'Power1.easeOut' }, 'scene2');
            timeline.fromTo( $earthVisuals[1], { opacity: 0 }, { opacity: 1, duration: .5, delay: 2.3, ease: 'Power1.easeOut'}, 'scene2')
            // timeline.fromTo( $earthVisuals[1].children[0], { opacity: 0 }, { opacity: 1, duration: .5, delay: 2.3, ease: 'Power1.easeOut'}, 'scene2')
            timeline.fromTo( $earthIslCanvas, { opacity: 0 }, { opacity: 1, duration: .5, delay: 2.3, ease: 'Power1.easeOut', 
              onUpdate: () => {
                if (!$listsNavs[0].classList.contains('on') ) {
                  $lists.querySelector('.lists-nav li.on') && $lists.querySelector('.lists-nav li.on').classList.remove('on');
                  $lists.querySelector('.detail-nav li.on') && $lists.querySelector('.detail-nav li.on').classList.remove('on');

                  $listsNavs[0].classList.add('on');
                  $detailNavs[0].classList.add('on');
                }

                controlVideo($earthVisuals[1].children[0].querySelector('.particles video'), 'play');
                controlVideo($earthVisuals[1].children[0].querySelector('.lines video'), 'play');
              },
            }, 'scene2');
            
            // isl visual sequence 돌고
            timeline.fromTo( sequenceProgress, { isl: 0 }, { isl: sequenceCount.isl-1, duration: 2.5, 
              onUpdate: () => {
                const frame = Math.round(sequenceProgress.isl);
                contextIsl.clearRect(0, 0, $earthIslCanvas.width, $earthIslCanvas.height);
                contextIsl.drawImage(sequenceImages.isl[frame], 0, 0);
              } 
            }, 'scene2-sequence');

            // 2 -- isl 들어가고, esa 나오고
            timeline.to( $earthIslCanvas, { opacity: 0, duration: 0.5, ease: 'Power1.easeIn' }, 'scene3');
            timeline.to( $detailItems[0], { opacity: 0, duration: 0.5, ease: 'Power1.easeIn' }, 'scene3');
            timeline.fromTo( $detailItems[0].children[0], { y: 0 }, { y: -100, duration: 1, delay: 1, ease: 'Power1.easeIn' }, 'scene3');
            timeline.fromTo( $detailItems[1], { opacity: 0 }, { opacity: 1, duration: 1, ease: 'Power1.easeOut' }, 'scene3');
            timeline.fromTo( $detailItems[1].querySelector('.subtitle'), { opacity: 0, y: 100, }, { opacity: 1, y: 0, duration: 1, ease: 'Power1.easeOut' }, 'scene3');
            timeline.fromTo( $detailItems[1].querySelector('.text'), { opacity: 0, y: 100, }, { opacity: 1, y: 0, duration: 1, delay: 0.1, ease: 'Power1.easeOut' }, 'scene3');
            timeline.fromTo( $earthEsaCanvas, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'Power1.easeOut', 
              onUpdate: () => { 
                if (!$listsNavs[0].classList.contains('on') ) {
                  $lists.querySelector('.lists-nav li.on') && $lists.querySelector('.lists-nav li.on').classList.remove('on');
                  $lists.querySelector('.detail-nav li.on') && $lists.querySelector('.detail-nav li.on').classList.remove('on');

                  $listsNavs[0].classList.add('on');
                  $detailNavs[0].classList.add('on');
                }
              },
              onComplete: () => {
                $lists.querySelector('.lists-nav li.on') && $lists.querySelector('.lists-nav li.on').classList.remove('on');
                $lists.querySelector('.detail-nav li.on') && $lists.querySelector('.detail-nav li.on').classList.remove('on');

                $listsNavs[1].classList.add('on');
                $detailNavs[1].classList.add('on');
              }
            }, 'scene3');

            // esa visual sequence 돌고
            timeline.fromTo( sequenceProgress, { esa: 0 }, { esa: sequenceCount.esa-1, duration: 2.5, 
              onUpdate: () => {
                const frame = Math.round(sequenceProgress.esa);
                contextEsa.clearRect(0, 0, $earthEsaCanvas.width, $earthEsaCanvas.height);
                contextEsa.drawImage(sequenceImages.esa[frame], 0, 0);
              } 
            }, 'scene3-sequence');

            // 3 -- esa 들어가고, obp 나오고
            timeline.to( $earthEsaCanvas, { opacity: 0, duration: 0.5, ease: 'Power1.easeIn' }, 'scene4');
            timeline.to( $detailItems[1], { opacity: 0, duration: .5, ease: 'Power1.easeIn' }, 'scene4');
            timeline.fromTo( $detailItems[1].children[0], { y: 0 }, { y: -100, duration: 1, ease: 'Power1.easeIn' }, 'scene4');
            timeline.fromTo( $detailItems[2].querySelector('.subtitle'), { opacity: 0, y: 100, }, { opacity: 1, y: 0, duration: 1, ease: 'Power1.easeOut' }, 'scene4');
            timeline.fromTo( $detailItems[2].querySelector('.text'), { opacity: 0, y: 100, }, { opacity: 1, y: 0, duration: 1, delay: 0.1, ease: 'Power1.easeOut' }, 'scene4');
            timeline.fromTo( $detailItems[2], { opacity: 0 }, { opacity: 1, duration: 1, ease: 'Power1.easeOut',
              onUpdate: () => { 
                if (!$listsNavs[1].classList.contains('on') ) {
                  $lists.querySelector('.lists-nav li.on') && $lists.querySelector('.lists-nav li.on').classList.remove('on');
                  $lists.querySelector('.detail-nav li.on') && $lists.querySelector('.detail-nav li.on').classList.remove('on');

                  $listsNavs[1].classList.add('on');
                  $detailNavs[1].classList.add('on');
                }
              },
              onComplete: () => {
                $lists.querySelector('.lists-nav li.on') && $lists.querySelector('.lists-nav li.on').classList.remove('on');
                $lists.querySelector('.detail-nav li.on') && $lists.querySelector('.detail-nav li.on').classList.remove('on');

                $listsNavs[2].classList.add('on');
                $detailNavs[2].classList.add('on');
              }
            }, 'scene4');

            // 4 -- line 사라지고 끝
            timeline.fromTo( $earthVisuals[1].children[0], { opacity: 1 }, { opacity: 0, duration: 1, delay: 1, ease: 'Power1.easeIn' }, 'scene5');
            timeline.fromTo( $earthVisuals[1].querySelector('.lines'), { scale: 1 }, { scale: 1.3, duration: 1, delay: 1, ease: 'Power1.easeIn' }, 'scene5');
            timeline.fromTo( $earthVisuals[1].querySelector('.particles'), { scale: 1 }, { scale: 1.3, duration: 1, delay: 1, ease: 'Power1.easeIn' }, 'scene5');
            timeline.to( $lists, { opacity: 0, duration: 1, delay: 1, ease: 'Power1.easeIn' }, 'scene5');
            timeline.to( $detailItems[2], { opacity: 0, duration: 1, delay: 1, ease: 'Power1.easeIn' }, 'scene5');
            timeline.fromTo, ( $detailItems[2].children[0], { y: 0 }, { y: -100, duration: 1, delay: 1, ease: 'Power1.easeIn' }, 'scene5'); 
          }

          const createTimelineMobile = function () {
            $details.style.paddingTop = (areaHeight - $detailItems[0].offsetHeight)/2 + 'px';

            timeline && timeline.kill();
            const version = isTablet ? 'mobile' : 'web';
            if ( timeline && timeline.version !== version ) {
              for (let i = 0; i < timeline.getChildren().length; i++) {
                const elem = timeline.getChildren()[i];
                if ( elem._targets[0].tagName ) {
                  gsap.set(elem._targets[0], { clearProps: true });
                }
              }
            }
            timeline = gsap.timeline({ paused: true });
            timeline.version = version;
            
            // 0
            timeline.fromTo( $intro.querySelector('.eyebrow'),           { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'Power1.easeOut' }, 'scene1');
            timeline.fromTo( $intro.querySelector('.title'),             { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.1, ease: 'Power1.easeOut' }, 'scene1');
            timeline.fromTo( $intro.querySelector('.text:nth-child(1)'), { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.2, ease: 'Power1.easeOut' }, 'scene1');
            timeline.fromTo( $intro.querySelector('.text:nth-child(2)'), { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.3, ease: 'Power1.easeOut' }, 'scene1');
            timeline.fromTo( $intro.querySelector('.overview'),          { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.4, ease: 'Power1.easeOut' }, 'scene1');
            timeline.fromTo( $earthVisuals[0], { opacity: 0 }, { opacity: 1, duration: 1, ease: 'Power1.easeOut' }, 'scene1');
            timeline.fromTo( $earthLineVisual, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'Power1.easeOut', 
              onUpdate: () => { 
                !$intro.classList.contains('on') && $intro.classList.add('on');

                $lists.querySelector('.lists-nav li.on') && $lists.querySelector('.lists-nav li.on').classList.remove('on');
                $lists.querySelector('.detail-nav li.on') && $lists.querySelector('.detail-nav li.on').classList.remove('on');
              }
            }, 'scene1');

            // 1 -- 지구 earth2로 이동, isl 나오고
            timeline.to( $earthVisuals[0], { opacity: 0, duration: 0.5, delay: 1, ease: 'Power1.easeIn' }, 'scene2');
            timeline.to( $earthLineVisual, { opacity: 0, duration: 0.5, delay: 1, ease: 'Power1.easeIn' }, 'scene2');
            timeline.fromTo( $intro, { opacity: 1, x: 0 }, { opacity: 0, x: -100, duration: 0.5, delay: 1, ease: 'Power1.easeIn' }, 'scene2');
            timeline.fromTo( 
              $earth, 
              getEarthPositionAndScale($earthVisuals[0]), 
              { ...getEarthPositionAndScale($earthVisuals[1]), duration: 1, delay: 1, ease: 'cubic.inOut' }, 
              'scene2'
            );
            timeline.fromTo( $stars, { scale: 1.2, x: 0 }, { scale: 1, x: 0, duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'scene2');
            timeline.fromTo( $lists, { opacity: 0 }, { opacity: 1, duration: 1, delay: 1.5, ease: 'Power1.easeOut' }, 'scene2');
            timeline.fromTo( $detailItems[0], { opacity: 0 }, { opacity: 1, duration: 1, delay: 1.5, ease: 'Power1.easeOut' }, 'scene2');
            timeline.fromTo( $detailItems[0].querySelector('.subtitle'), { y: 100, }, { y: 0, duration: 1, delay: 1.5, ease: 'Power1.easeOut' }, 'scene2');
            timeline.fromTo( $detailItems[0].querySelector('.text'), { y: 100, }, { y: 0, duration: 1, delay: 1.6, ease: 'Power1.easeOut' }, 'scene2');
            timeline.fromTo( $earthVisuals[1].children[0], { opacity: 0 }, { opacity: 1, duration: .5, delay: 2.3, ease: 'Power1.easeOut'}, 'scene2')
            timeline.fromTo( $earthIslCanvas, { opacity: 0 }, { opacity: 1, duration: .5, delay: 2.3, ease: 'Power1.easeOut', 
              onUpdate: () => {
                if (!$listsNavs[0].classList.contains('on') ) {
                  $lists.querySelector('.lists-nav li.on') && $lists.querySelector('.lists-nav li.on').classList.remove('on');
                  $lists.querySelector('.detail-nav li.on') && $lists.querySelector('.detail-nav li.on').classList.remove('on');

                  $listsNavs[0].classList.add('on');
                  $detailNavs[0].classList.add('on');
                }

                controlVideo($earthVisuals[1].children[0].querySelector('.particles video'), 'play');
                controlVideo($earthVisuals[1].children[0].querySelector('.lines video'), 'play');
              },
            }, 'scene2');

            // 2 --- 
            timeline.fromTo( $details, { y: 0 }, { y: -$details.offsetHeight, duration: 4 }, 'scene3');
            timeline.fromTo( $detailItems[1], { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0, }, 'scene3');
            timeline.fromTo( $detailItems[1].children[0], { opacity: 1 }, { opacity: 0, duration: 1, delay: 1, }, 'scene3');
            timeline.fromTo( $detailItems[1].children[1], { opacity: 1 }, { opacity: 0, duration: 1, delay: 1, }, 'scene3');
            timeline.fromTo( $detailItems[2], { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 1, }, 'scene3');
            timeline.fromTo( $detailItems[2].children[0], { opacity: 1 }, { opacity: 0, duration: 1, delay: 2, }, 'scene3');
            timeline.fromTo( $detailItems[2].children[1], { opacity: 1 }, { opacity: 0, duration: 1, delay: 2, }, 'scene3');
            
            timeline.to( $earthVisuals[1].children[0], { opacity: 0, duration: 0.5, delay: 2.5, ease: 'Power1.easeIn' }, 'scene3');
            timeline.fromTo( $earthVisuals[1].querySelector('.lines'), { scale: 1 }, { scale: 1.3, duration: 0.5, delay: 2.5, ease: 'Power1.easeIn' }, 'scene3');
            timeline.fromTo( $earthVisuals[1].querySelector('.particles'), { scale: 1 }, { scale: 1.3, duration: 0.5, delay: 2.5, ease: 'Power1.easeIn' }, 'scene3');
          }
        })();
      })();

      // observation
      (() => {
        const $observation = $main.querySelector('.observation');
        const $earthVisuals = $observation.querySelectorAll('[class*="earth-visual-"]');
        // earthline
        const $earthLine = $observation.querySelector('.earth-line');
        const $targeting = $earthLine.querySelector('.targeting');
        const $targetingIn = $earthLine.querySelector('.targeting-in');
        const $target = $earthLine.querySelector('.target');
        const $point = $earthLine.querySelector('.point');
        const $pointSpot = $earthLine.querySelector('.point .spot');
        // intro
        const $intro = $observation.querySelector('.intro');
        // lists
        const $lists = $observation.querySelector('.lists');
        const $listsNavs = $lists.querySelectorAll('.lists-nav li');
        const $details = $lists.querySelector('.details');
        const $detailItems = $lists.querySelectorAll('.details .item');
        const $detailNavs = $lists.querySelectorAll('.detail-nav li');
        // info
        const $info = $observation.querySelector('.info');
        const $infoItems = $info.querySelectorAll('.item');
        // geoint
        const $geoint = $observation.querySelector('.geoint');
        const $geointTexts = $geoint.querySelector('.texts');
        const $geointBg = $geoint.querySelector('.bg');
        const $geointVideo = $geoint.querySelector('.bg video');
        const $geointCanvas = $geoint.querySelector('.bg canvas');
        const geointContext = $geointCanvas.getContext('2d');

        const sequenceProgress = { frame: 0 }
        const sequenceImages = [];
        const sequenceCount = 32;

        let timeline, observationHeight;
        let lottieOptions, lottieObservation;

        state.on('scroll', (scrollTop) => {
          const rect = $observation.getBoundingClientRect();
          if (rect.top < areaHeight && rect.bottom > 0) {
            const progress = -rect.top / observationHeight;
            // timeline.progress(1);
            timeline.progress(progress);
          } 
        });
        state.on('mediachange', (media) => {
        });
        state.on('resize', (areaWidth, areaHeight) => {
          observationHeight = $observation.offsetHeight - areaHeight;
          
          if ( !isTablet ) {
            sequenceImages.length == 0 && createSequence(sequenceImages, sequenceCount, 'observation-geoint/intro');
            createTimelineWeb();
          } else {
            createTimelineMobile();
          }
        });

        const createLottie = function () {
          if ( lottieObservation ) return;
          
          lottieOptions = { renderer: 'svg', loop: true, autoplay: false };
          lottieObservation = lottie.loadAnimation({
            container: $target.querySelector('.decoline'),
            path: `${ imagePath }satellite/observation-intro.json`,
            ...lottieOptions,
          });
        }
        createLottie();

        const createTimelineWeb = function () {
          $details.style.paddingTop = '';

          timeline && timeline.kill();
          // resetNodes($observation);

          const version = isTablet ? 'mobile' : 'web';
          if ( timeline && timeline.version !== version ) {
            for (let i = 0; i < timeline.getChildren().length; i++) {
              const elem = timeline.getChildren()[i];
              if ( elem._targets[0].tagName ) {
                gsap.set(elem._targets[0], { clearProps: true });
              }
            }
          }
          
          timeline = gsap.timeline({ paused: true });
          timeline.version = 'web';

          // scene1 -- intro
          timeline.fromTo( 
            $earth, 
            getEarthPositionAndScale($earthVisualAll[6]), 
            { ...getEarthPositionAndScale($earthVisuals[0]), duration: 1, ease: 'Power1.easeOut',
              onUpdate: () => {
                $earthLine.classList.contains('on') && $earthLine.classList.remove('on');

                $lists.querySelector('.lists-nav li.on') && $lists.querySelector('.lists-nav li.on').classList.remove('on');
                $lists.querySelector('.detail-nav li.on') && $lists.querySelector('.detail-nav li.on').classList.remove('on');
                
                !lottieObservation.isPaused && resetLottie(lottieObservation);
              },
              onComplete: () => { 
                !$earthLine.classList.contains('on') && $earthLine.classList.add('on');

                if ( lottieObservation.isPaused ) {
                  lottieObservation._resetted = false;
                  lottieObservation.play();
                }
              }
            }, 
            'scene1'
          );
          timeline.fromTo( $stars, { scale: 1, x: 0, y: 0 }, { scale: 0.5, duration: 1, ease: 'Power1.easeOut' }, 'scene1');
          timeline.fromTo( $intro.querySelector('.eyebrow'), { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, ease: 'Power1.easeOut' }, 'scene1');
          timeline.fromTo( $intro.querySelector('.title'), { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, delay: 0.1, ease: 'Power1.easeOut' }, 'scene1');
          timeline.fromTo( $intro.querySelector('.text'), { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'Power1.easeOut' }, 'scene1');
          timeline.fromTo( $earthVisuals[0], { opacity: 0 }, { opacity: 1, duration: 1, ease: 'Power1.easeOut' }, 'scene1');

          // scene1-blank
          timeline.to($earthVisuals[0], { opacity: 0, duration: 0.5, delay: 2, ease: 'Power1.easeOut', 
            onUpdate: () => {
              $earthLine.classList.contains('set1') && $earthLine.classList.remove('set1');

              if ( lottieObservation.isPaused ) {
                lottieObservation._resetted = false;
                lottieObservation.play();
              }
            }
          }, 'scene1-blank');

          // scene2 -- list 1 나옴
          timeline.fromTo( $intro, { y: 0, opacity: 1 }, { y: -100, opacity: 0, duration: 0.5, ease: 'Power1.easeOut' }, 'scene2');
          timeline.to( $earth, { ...getEarthPositionAndScale($earthVisuals[1]), duration: 1, ease: 'Power1.easeOut', 
            onUpdate: () => { 
              !$earthLine.classList.contains('set1') && $earthLine.classList.add('set1'); 
              !lottieObservation.isPaused && resetLottie(lottieObservation);
            } 
          }, 'scene2');
          timeline.to( $stars, { scale: 1.2, duration: 1, ease: 'Power1.easeOut' }, 'scene2');
          timeline.fromTo( $lists, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'Power1.easeOut' }, 'scene2');
          timeline.fromTo( $detailItems[0], { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'Power1.easeOut',
            onUpdate: () => {
              if (!$listsNavs[0].classList.contains('on') ) {
                $lists.querySelector('.lists-nav li.on') && $lists.querySelector('.lists-nav li.on').classList.remove('on');
                $lists.querySelector('.detail-nav li.on') && $lists.querySelector('.detail-nav li.on').classList.remove('on');

                $listsNavs[0].classList.add('on');
                $detailNavs[0].classList.add('on');
              }
            },
          }, 'scene2');
          timeline.fromTo( $targeting, { left: '50%', width: 756 }, { left: '35%', width: 275, duration: 1, ease: 'Power1.easeOut' }, 'scene2');
          timeline.fromTo( $targetingIn, { y: 0 }, { y: -50, duration: 1, ease: 'Power1.easeOut' }, 'scene2');
          timeline.fromTo( $target, { height: 370 }, { height: 160, duration: 1, ease: 'Power1.easeOut' }, 'scene2');
          timeline.fromTo( $point, { x: 0, y: 0, scale: 1, }, { x: '-10%', duration: 1, ease: 'Power1.easeOut' }, 'scene2');
          timeline.to( $pointSpot, { width: 52, height: 23, x: '-30%', duration: 1, ease: 'Power1.easeOut' }, 'scene2');

          // scene3 -- list 2 나옴
          timeline.to( $detailItems[0] , { y: -100, opacity: 0, duration: 0.5, delay: 1, ease: 'Power1.easeOut' }, 'scene3');
          timeline.fromTo( $detailItems[1], { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 1, ease: 'Power1.easeOut',
            onUpdate: () => { 
              if (!$listsNavs[0].classList.contains('on') ) {
                $lists.querySelector('.lists-nav li.on') && $lists.querySelector('.lists-nav li.on').classList.remove('on');
                $lists.querySelector('.detail-nav li.on') && $lists.querySelector('.detail-nav li.on').classList.remove('on');

                $listsNavs[0].classList.add('on');
                $detailNavs[0].classList.add('on');
              }
            },
            onComplete: () => {
              $lists.querySelector('.lists-nav li.on') && $lists.querySelector('.lists-nav li.on').classList.remove('on');
              $lists.querySelector('.detail-nav li.on') && $lists.querySelector('.detail-nav li.on').classList.remove('on');

              $listsNavs[1].classList.add('on');
              $detailNavs[1].classList.add('on');
            }
          }, 'scene3');
          timeline.to($targeting, { left: '40%', width: 344, duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'scene3');
          timeline.to($targetingIn, { y: 20, duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'scene3');
          timeline.to($target, { height: 210, duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'scene3');
          timeline.to($point, { x: '0', y: '-40%', duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'scene3');
          timeline.to($pointSpot, { x: '30%', duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'scene3');

          // scene4 -- list 3 나옴
          timeline.to( $detailItems[1] , { y: -100, opacity: 0, duration: 0.5, delay: 1, ease: 'Power1.easeOut' }, 'scene4');
          timeline.fromTo( $detailItems[2], { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 1, ease: 'Power1.easeOut',
            onUpdate: () => { 
              if (!$listsNavs[1].classList.contains('on') ) {
                $lists.querySelector('.lists-nav li.on') && $lists.querySelector('.lists-nav li.on').classList.remove('on');
                $lists.querySelector('.detail-nav li.on') && $lists.querySelector('.detail-nav li.on').classList.remove('on');

                $listsNavs[1].classList.add('on');
                $detailNavs[1].classList.add('on');
              }
            },
            onComplete: () => {
              $lists.querySelector('.lists-nav li.on') && $lists.querySelector('.lists-nav li.on').classList.remove('on');
              $lists.querySelector('.detail-nav li.on') && $lists.querySelector('.detail-nav li.on').classList.remove('on');

              $listsNavs[2].classList.add('on');
              $detailNavs[2].classList.add('on');
            }
          }, 'scene4');
          timeline.to($targeting, { left: '38%', width: 273, duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'scene4');
          timeline.to($target, { height: 160, duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'scene4');
          timeline.to($point, { x: '-50%', y: '20%', duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'scene4');
          timeline.to($pointSpot, { x: 0, duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'scene4');

          // scene5 -- lists 사라지고, info1 나옴
          timeline.to( $lists, { opacity: 0, duration: 0.5, delay: 1, ease: 'Power1.easeIn' }, 'scene5');
          timeline.fromTo( $earthLine, { opacity: 1 }, { opacity: 0, duration: 0.5, delay: 1, ease: 'Power1.easeIn' }, 'scene5');
          timeline.to( $stars, { scale: 1, x: areaHeight/2, duration: 2, delay: 1, ease: 'Power1.easeIn' }, 'scene5');
          timeline.to( $earth, { ...getEarthPositionAndScale($earthVisuals[2]), duration: 2, delay: 1, ease: 'Power1.easeIn', }, 'scene5');
          timeline.fromTo( $infoItems[0].querySelector('.sourceby'), { opacity: 0 }, { opacity: 1, duration: 1, delay: 2, ease: 'Power1.easeOut' }, 'scene5');
          timeline.fromTo( $infoItems[0].children[0], { opacity: 0, x: 100 }, { opacity: 1, x: 0, duration: 1, delay: 2, ease: 'Power1.easeOut' }, 'scene5');
          timeline.fromTo( $infoItems[0].querySelector('.texts'), { opacity: 0, y: 0 }, { opacity: 1, duration: 1, delay: 2, ease: 'Power1.easeOut' }, 'scene5');
          timeline.fromTo( $infoItems[0].querySelector('.subtitle'), { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, delay: 2, ease: 'Power1.easeOut' }, 'scene5');
          timeline.fromTo( $infoItems[0].querySelector('.text:nth-child(1)'), { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, delay: 2.1, ease: 'Power1.easeOut' }, 'scene5');
          timeline.fromTo( $infoItems[0].querySelector('.text:nth-child(2)'), { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, delay: 2.2, ease: 'Power1.easeOut' }, 'scene5');
          timeline.fromTo( $infoItems[0].querySelector('.text:nth-child(3)'), { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, delay: 2.3, ease: 'Power1.easeOut' }, 'scene5');
          timeline.fromTo( $earthVisuals[2], { opacity: 0 }, { opacity: 1, duration: 0.2, delay: 2.8, ease: 'Power1.easeOut' }, 'scene5');

          // scene6 -- info1 사라지고, info2 나옴
          timeline.to( $earthVisuals[2], { opacity: 0, duration: 0.2, delay: 0.8, ease: 'Power1.easeIn' }, 'scene6');
          timeline.to( $infoItems[0].children[0], { opacity: 0, duration: 1, delay: 1, ease: 'Power1.easeIn' }, 'scene6');
          timeline.to( $infoItems[0].querySelector('.texts'), { opacity: 0, duration: 1, delay: 1, ease: 'Power1.easeIn' }, 'scene6');
          timeline.to( $infoItems[0].querySelector('.sourceby'), { opacity: 0, duration: 1, delay: 1, ease: 'Power1.easeIn' }, 'scene6');
          timeline.to( $earth, { ...getEarthPositionAndScale($earthVisuals[3]), duration: 2, delay: 1, ease: 'Power1.easeIn', }, 'scene6');
          timeline.to( $stars, { x: 0, y: areaHeight/2, duration: 2, delay: 1, ease: 'Power1.easeIn' }, 'scene6');
          timeline.fromTo( $infoItems[1].children[0], { opacity: 0, y: -100, }, { opacity: 1, y: 0, duration: 1, delay: 2, ease: 'Power1.easeOut' }, 'scene6');
          timeline.fromTo( $infoItems[1].querySelector('.texts'), { opacity: 0, y: 0 }, { opacity: 1, duration: 1, delay: 2, ease: 'Power1.easeOut' }, 'scene6');
          timeline.fromTo( $infoItems[1].querySelector('.subtitle'), { opacity: 0, y: 100, }, { opacity: 1, y: 0, duration: 1, delay: 2, ease: 'Power1.easeOut' }, 'scene6');
          timeline.fromTo( $infoItems[1].querySelector('.text:nth-child(1)'), { opacity: 0, y: 100, }, { opacity: 1, y: 0, duration: 1, delay: 2.1, ease: 'Power1.easeOut' }, 'scene6');
          timeline.fromTo( $infoItems[1].querySelector('.text:nth-child(2)'), { opacity: 0, y: 100, }, { opacity: 1, y: 0, duration: 1, delay: 2.2, ease: 'Power1.easeOut' }, 'scene6');
          timeline.fromTo( $infoItems[1].querySelector('.text:nth-child(3)'), { opacity: 0, y: 100, }, { opacity: 1, y: 0, duration: 1, delay: 2.3, ease: 'Power1.easeOut' }, 'scene6');

          // scene7 - 지구 확대되면서 ai-geoint 나옴 
          timeline.to( $infoItems[1].children[0], { opacity: 0, duration: 0.5, delay: 1, ease: 'Power1.easeIn' }, 'scene7');
          timeline.to( $infoItems[1].querySelector('.texts'), { opacity: 0, y: -100, duration: 0.5, delay: 1, ease: 'Power1.easeIn' }, 'scene7');
          timeline.to( $earth, { ...getEarthPositionAndScale($earthVisuals[4]), duration: 2, delay: 1, ease: 'Power1.easeOut' }, 'scene7');
          timeline.to( $stars, { x: 0, y: 0, scale: 2, duration: 2, delay: 1, ease: 'Power1.easeOut' }, 'scene7');
          timeline.fromTo($geoint, { opacity: 0 }, { opacity: 1, duration: 1, delay: 2, ease: 'Power1.easeOut' }, 'scene7');
          timeline.fromTo($geointTexts.querySelector('.eyebrow'), { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, delay: 2, ease: 'Power1.easeOut' }, 'scene7');
          timeline.fromTo($geointTexts.querySelector('.title'), { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, delay: 2.1, ease: 'Power1.easeOut' }, 'scene7');
          timeline.fromTo($geointTexts.querySelector('.text:nth-child(1)'), { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, delay: 2.2, ease: 'Power1.easeOut' }, 'scene7');
          timeline.fromTo($geointTexts.querySelector('.text:nth-child(2)'), { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, delay: 2.3, ease: 'Power1.easeOut' }, 'scene7');

          // scene8 - geoint 스크롤 시퀀스 돌고, 영상 재생
          timeline.fromTo( sequenceProgress, { frame: 0 }, { frame: sequenceCount-1, duration: 1, 
            onUpdate: () => {
              const frame = Math.round(sequenceProgress.frame);
              geointContext.clearRect(0, 0, $geointCanvas.width, $geointCanvas.height);
              geointContext.drawImage(sequenceImages[frame], 0, 0);
              
              $geointCanvas.classList.contains('hide') && $geointCanvas.classList.remove('hide');
              !$geointVideo.classList.contains('hide') && $geointVideo.classList.add('hide');
              controlVideo($geointVideo, 'paused');
            },
            onComplete: () => {
              !$geointCanvas.classList.contains('hide') && $geointCanvas.classList.add('hide');
              $geointVideo.classList.contains('hide') && $geointVideo.classList.remove('hide');
              controlVideo($geointVideo, 'play');
            }
          }, 'scene8');

          // scene9
          timeline.to( $geoint, { opacity: 0, duration: 0.5, delay: 2, ease: 'Power1.easeIn' }, 'scene9');
          timeline.fromTo( $geointTexts.querySelector('.texts-in'), { opacity: 1, y: 0 }, { opacity: 0, y: -100, duration: 0.5, delay: 2, ease: 'Power1.easeIn' }, 'scene9');
          timeline.to( $earth, { ...getEarthPositionAndScale($main.querySelector('.roadmap .earth-visual-1')), duration: 1, delay: 2, ease: 'Power1.easeIn' }, 'scene9' );
          timeline.to( $stars, { scale: 1, duration: 1, delay: 2, ease: 'Power2.easeIn' }, 'scene9');
          // timeline.fromTo( $keys, { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, ease: 'Power1.easeOut' }, 'scene9');

        }

        const createTimelineMobile = function () {
          $earthLine.classList.contains('set1') && $earthLine.classList.remove('set1');
          $details.style.paddingTop = (areaHeight - $detailItems[0].offsetHeight)/2 + 'px';

          timeline && timeline.kill();
          // resetNodes($observation);

          const version = isTablet ? 'mobile' : 'web';
          if ( timeline && timeline.version !== version ) {
            for (let i = 0; i < timeline.getChildren().length; i++) {
              const elem = timeline.getChildren()[i];
              if ( elem._targets[0].tagName ) {
                gsap.set(elem._targets[0], { clearProps: true });
              }
            }
          }
          
          timeline = gsap.timeline({ paused: true });
          timeline.version = 'mobile';

          // scene1 -- intro
          timeline.fromTo( 
            $earth, 
            getEarthPositionAndScale($earthVisualAll[6]), 
            { ...getEarthPositionAndScale($earthVisuals[0]), duration: 1, ease: 'Power1.easeOut',
              onUpdate: () => {
                $earthLine.classList.contains('on') && $earthLine.classList.remove('on');

                $lists.querySelector('.lists-nav li.on') && $lists.querySelector('.lists-nav li.on').classList.remove('on');
                $lists.querySelector('.detail-nav li.on') && $lists.querySelector('.detail-nav li.on').classList.remove('on');
              },
              onComplete: () => { 
                !$earthLine.classList.contains('on') && $earthLine.classList.add('on');
              }
            }, 
            'scene1'
          );
          timeline.fromTo( $stars, { scale: 1, x: 0, y: 0 }, { scale: 0.5, duration: 1, ease: 'Power1.easeOut' }, 'scene1');
          timeline.fromTo( $intro.querySelector('.eyebrow'), { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, ease: 'Power1.easeOut' }, 'scene1');
          timeline.fromTo( $intro.querySelector('.title'), { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, delay: 0.1, ease: 'Power1.easeOut' }, 'scene1');
          timeline.fromTo( $intro.querySelector('.text'), { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'Power1.easeOut' }, 'scene1');
          timeline.fromTo( $earthVisuals[0], { opacity: 0 }, { opacity: 1, duration: 1, ease: 'Power1.easeOut' }, 'scene1');

          // scene1-blank
          timeline.to($earthVisuals[0], { opacity: 0, duration: 0.5, delay: 1, ease: 'Power1.easeOut', 
            onUpdate: () => {
              if ( lottieObservation.isPaused ) {
                lottieObservation._resetted = false;
                lottieObservation.play();
              }
            }
          }, 'scene1-blank');
          
          // scene2 -- list 1 나옴
          timeline.fromTo( $intro, { y: 0, opacity: 1 }, { y: -100, opacity: 0, duration: 0.5, ease: 'Power1.easeOut' }, 'scene2');
          timeline.fromTo( $earthLine, { opacity: 1 }, { opacity: 0, duration: 0.5, ease: 'Power1.easeOut' }, 'scene2');
          timeline.to( $earth, { ...getEarthPositionAndScale($earthVisuals[1]), duration: 1, ease: 'Power1.easeOut',
            onUpdate: () => { 
              !lottieObservation.isPaused && resetLottie(lottieObservation);
            }
          }, 'scene2');
          timeline.to( $stars, { scale: 1.2, duration: 1, ease: 'Power1.easeOut' }, 'scene2');
          timeline.fromTo( $lists, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'Power1.easeOut' }, 'scene2');

          // scene3
          timeline.fromTo( $details, { y: 0 }, { y: -$details.offsetHeight, duration: 6, ease: 'Power0.easeNone' }, 'scene3');
          timeline.fromTo( $detailItems[0].children[0], { opacity: 1 }, { opacity: 0, duration: 1, delay: 0.6, ease: 'Power0.easeNone' }, 'scene3');
          timeline.fromTo( $detailItems[0].children[1], { opacity: 1 }, { opacity: 0, duration: 1, delay: 0.6, ease: 'Power0.easeNone' }, 'scene3');
          timeline.fromTo( $detailItems[1], { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.3, ease: 'Power0.easeNone' }, 'scene3');
          timeline.fromTo( $detailItems[1].children[0], { opacity: 1 }, { opacity: 0, duration: 1.6, delay: 1.6, ease: 'Power0.easeNone' }, 'scene3');
          timeline.fromTo( $detailItems[1].children[1], { opacity: 1 }, { opacity: 0, duration: 1.6, delay: 1.6, ease: 'Power0.easeNone' }, 'scene3');
          timeline.fromTo( $detailItems[2], { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 1.6, ease: 'Power0.easeNone' }, 'scene3');
          timeline.fromTo( $detailItems[2].children[0], { opacity: 1 }, { opacity: 0, duration: 1.6, delay: 3.2, ease: 'Power0.easeNone' }, 'scene3');
          timeline.fromTo( $detailItems[2].children[1], { opacity: 1 }, { opacity: 0, duration: 1.6, delay: 3.2, ease: 'Power0.easeNone' }, 'scene3');

          // scene5 -- lists 사라지고, info1 나옴
          timeline.to( $stars, { scale: 1, x: areaHeight/2, duration: 2, ease: 'Power1.easeIn' }, 'scene5');
          timeline.to( $earth, { ...getEarthPositionAndScale($earthVisuals[2]), duration: 2, ease: 'Power1.easeIn', }, 'scene5');
          timeline.fromTo( $infoItems[0].querySelector('.sourceby'), { opacity: 0 }, { opacity: 1, duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'scene5');
          timeline.fromTo( $infoItems[0].children[0], { opacity: 0, x: 100 }, { opacity: 1, x: 0, duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'scene5');
          timeline.fromTo( $infoItems[0].querySelector('.texts'), { opacity: 0, y: 0 }, { opacity: 1, duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'scene5');
          timeline.fromTo( $infoItems[0].querySelector('.texts .subtitle'), { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'scene5');
          timeline.fromTo( $infoItems[0].querySelector('.texts .text:nth-child(1)'), { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, delay: 1.1, ease: 'Power1.easeOut' }, 'scene5');
          timeline.fromTo( $infoItems[0].querySelector('.texts .text:nth-child(2)'), { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, delay: 1.2, ease: 'Power1.easeOut' }, 'scene5');
          timeline.fromTo( $infoItems[0].querySelector('.texts .text:nth-child(3)'), { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, delay: 1.3, ease: 'Power1.easeOut' }, 'scene5');
          timeline.fromTo( $earthVisuals[2], { opacity: 0 }, { opacity: 1, duration: 0.2, delay: 1.8, ease: 'Power1.easeOut' }, 'scene5');

          // scene6 -- info1 사라지고, info2 나옴
          timeline.to( $earthVisuals[2], { opacity: 0, duration: 0.2, delay: 0.8, ease: 'Power1.easeIn' }, 'scene6');
          timeline.to( $infoItems[0].querySelector('.sourceby'), { opacity: 0, duration: 1, delay: 1, ease: 'Power1.easeIn' }, 'scene6');
          timeline.to( $infoItems[0].children[0], { opacity: 0, duration: 1, delay: 1, ease: 'Power1.easeIn' }, 'scene6');
          timeline.to( $infoItems[0].querySelector('.texts'), { opacity: 0, duration: 1, delay: 1, ease: 'Power1.easeIn' }, 'scene6');
          timeline.to( $earth, { ...getEarthPositionAndScale($earthVisuals[3]), duration: 2, delay: 1, ease: 'Power1.easeIn', }, 'scene6');
          timeline.to( $stars, { x: 0, y: areaHeight/2, duration: 2, delay: 1, ease: 'Power1.easeIn' }, 'scene6');
          timeline.fromTo( $infoItems[1].children[0], { opacity: 0, y: -100, }, { opacity: 1, y: 0, duration: 1, delay: 2, ease: 'Power1.easeOut' }, 'scene6');
          timeline.fromTo( $infoItems[1].querySelector('.texts'), { opacity: 0, y: 0 }, { opacity: 1, duration: 1, delay: 2, ease: 'Power1.easeOut' }, 'scene6');
          timeline.fromTo( $infoItems[1].querySelector('.texts .subtitle'), { opacity: 0, y: 100, }, { opacity: 1, y: 0, duration: 1, delay: 2, ease: 'Power1.easeOut' }, 'scene6');
          timeline.fromTo( $infoItems[1].querySelector('.texts .text:nth-child(1)'), { opacity: 0, y: 100, }, { opacity: 1, y: 0, duration: 1, delay: 2.1, ease: 'Power1.easeOut' }, 'scene6');
          timeline.fromTo( $infoItems[1].querySelector('.texts .text:nth-child(2)'), { opacity: 0, y: 100, }, { opacity: 1, y: 0, duration: 1, delay: 2.2, ease: 'Power1.easeOut' }, 'scene6');
          timeline.fromTo( $infoItems[1].querySelector('.texts .text:nth-child(3)'), { opacity: 0, y: 100, }, { opacity: 1, y: 0, duration: 1, delay: 2.3, ease: 'Power1.easeOut' }, 'scene6');

          // scene7 - 지구 확대되면서 ai-geoint 나옴 
          timeline.to( $infoItems[1].children[0], { opacity: 0, duration: 0.5, delay: 1, ease: 'Power1.easeIn' }, 'scene7');
          timeline.to( $infoItems[1].querySelector('.texts'), { opacity: 0, y: -100, duration: 0.5, delay: 1, ease: 'Power1.easeIn' }, 'scene7');
          timeline.to( $earth, { ...getEarthPositionAndScale($earthVisuals[4]), duration: 2, delay: 1, ease: 'Power1.easeOut' }, 'scene7');
          timeline.to( $stars, { x: 0, y: 0, scale: 2, duration: 2, delay: 1, ease: 'Power1.easeOut' }, 'scene7');
          timeline.fromTo($geoint, { opacity: 0 }, { opacity: 1, duration: 1, delay: 2, ease: 'Power1.easeOut' }, 'scene7');
          timeline.fromTo($geointTexts.querySelector('.eyebrow'), { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, delay: 2, ease: 'Power1.easeOut' }, 'scene7');
          timeline.fromTo($geointTexts.querySelector('.title'), { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, delay: 2.1, ease: 'Power1.easeOut' }, 'scene7');
          timeline.fromTo($geointTexts.querySelector('.text:nth-child(1)'), { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, delay: 2.2, ease: 'Power1.easeOut' }, 'scene7');
          timeline.fromTo($geointTexts.querySelector('.text:nth-child(2)'), { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, delay: 2.3, ease: 'Power1.easeOut' }, 'scene7');

          // scene9
          timeline.to( $geoint, { opacity: 0, duration: 0.5, delay: 1, ease: 'Power1.easeIn' }, 'scene9');
          timeline.fromTo( $geointTexts.querySelector('.texts-in'), { opacity: 1, y: 0 }, { opacity: 0, y: -100, duration: 0.5, delay: 1, ease: 'Power1.easeIn' }, 'scene9');
          timeline.to( $earth, { ...getEarthPositionAndScale($main.querySelector('.roadmap .earth-visual-1')), duration: 1, delay: 1, ease: 'Power1.easeIn' }, 'scene9' );
          timeline.to( $stars, { scale: 1, duration: 1, delay: 1, ease: 'Power2.easeIn' }, 'scene9');

        }
      })();

      // roadmap
      (() => {
        const $roadmap = $main.querySelector('.roadmap');
        const $earthVisuals = $roadmap.querySelectorAll('[class*="earth-visual-"]');
        const $earthSats = $roadmap.querySelector('.earth-satellite');
        const $earthSatsOverlay = $earthSats.querySelector('.overlay');
        const $earthSatsOverlayIn = $earthSats.querySelector('.overlay-in');
        const $earthSatsLeo = $earthSats.querySelector('.leo');
        const $earthSatsLeoIn = $earthSats.querySelector('.leo-in');
        const $earthSatsGrounds = $earthSats.querySelector('.grounds');
        const $earthSatsGround = $earthSats.querySelector('.ground');
        const $earthSatsServices = $earthSats.querySelectorAll('[class*="service-"]');
        const $earthSatsText = $earthSats.querySelector('.text');
        const $earthSatsIntenets = $earthSats.querySelectorAll('.internet');
        const $textsChild = $roadmap.querySelectorAll('.texts p');

        const lottieOptions = { renderer: 'svg', loop: true, autoplay: false };
        let lottieStation, lottieInternet1, lottieInternet2, lottieInternet3;

        let timeline, roadmapHeight;

        state.on('scroll', (scrollTop) => {
          const rect = $roadmap.getBoundingClientRect();
          if (rect.top < areaHeight && rect.bottom > 0) {
            const progress = -rect.top / roadmapHeight;
            // timeline.progress(1);
            timeline.progress(progress);
          } else {
            controlVideo($earthVisuals[0].querySelector('video'), 'pause');

            if ( !isTablet ) {
              !lottieStation.isPaused && resetLottie(lottieStation);
              !lottieInternet1.isPaused && resetLottie(lottieInternet1);
              !lottieInternet2.isPaused && resetLottie(lottieInternet2);
              !lottieInternet3.isPaused && resetLottie(lottieInternet3);
            }
          }
        });
        state.on('resize', (areaWidth, areaHeight) => {
          roadmapHeight = $roadmap.offsetHeight - areaHeight;
          
          if ( !isTablet ) {
            createLottie();
            createTimelineWeb();
          } else {
            createTimelineMobile();
          }

          if ( $earthSats.offsetHeight < areaHeight ) {
            !$earthSats.classList.contains('bottom') && $earthSats.classList.add('bottom');
          } else {
            $earthSats.classList.contains('bottom') && $earthSats.classList.remove('bottom');
          }
        });

        const createLottie = function () {
          if ( lottieStation ) return;
          
          lottieStation = lottie.loadAnimation({
            container: $earthSatsGround.querySelector('.station .motion'),
            path: `${ imagePath }satellite/roadmap-sats-ground-station-motion.json`,
            ...lottieOptions,
          });
          lottieInternet1 = lottie.loadAnimation({
            container: $earthSatsIntenets[0],
            path: `${ imagePath }satellite/roadmap-sats-internet.json`,
            ...lottieOptions,
          });
          lottieInternet2 = lottie.loadAnimation({
            container: $earthSatsIntenets[1],
            path: `${ imagePath }satellite/roadmap-sats-internet.json`,
            ...lottieOptions,
          });
          lottieInternet3 = lottie.loadAnimation({
            container: $earthSatsIntenets[2],
            path: `${ imagePath }satellite/roadmap-sats-internet.json`,
            ...lottieOptions,
          });
        }

        const createTimelineWeb = function () {
          timeline && timeline.kill();
          // resetNodes($roadmap);

          const version = isTablet ? 'mobile' : 'web';
          if ( timeline && timeline.version !== version ) {
            for (let i = 0; i < timeline.getChildren().length; i++) {
              const elem = timeline.getChildren()[i];
              if ( elem._targets[0].tagName ) {
                gsap.set(elem._targets[0], { clearProps: true });
              }
            }
          }
          
          timeline = gsap.timeline({ paused: true });
          timeline.version = 'web';

          // scene1 - connect the future
          timeline.fromTo($textsChild[0], { opacity: 0, y: '100%' }, { opacity: 1, y: 0, duration: 1, ease: 'Power1.easeOut' }, 'scene1');
          timeline.fromTo($earthVisuals[0], { opacity: 0, }, { opacity: 1, duration: 1, ease: 'Power1.easeOut',
            onUpdate: () => { controlVideo($earthVisuals[0].querySelector('video'), 'play'); },
          }, 'scene1');
          timeline.to($textsChild[0], { opacity: 0, y: -100, duration: 1, ease: 'Power1.easeIn' }, 'scene1out');
          timeline.to($earthVisuals[0], { opacity: 0, duration: 0.5, delay: 0.5, ease: 'Power1.easeIn', 
            onUpdate: () => { controlVideo($earthVisuals[0].querySelector('video'), 'play'); },
            onComplete: () => { controlVideo($earthVisuals[0].querySelector('video'), 'pause'); } 
          }, 'scene1out');

          // scene2 - 초연결 초지능
          // timeline.fromTo( $stars, { scale: 1, y: 0, }, { scale: 2, y: areaHeight/2, duration: 3, ease: 'Power2.easeOut' }, 'scene2');
          timeline.fromTo( $earth, getEarthPositionAndScale($earthVisuals[0]), { ...getEarthPositionAndScale($earthVisuals[1]), duration: 3, ease: 'Power1.easeOut', }, 'scene2');
          for (let i = 0; i < $textsChild[1].children.length; i++) {
            const span = $textsChild[1].children[i];
            if ( span.tagName == 'SPAN' ) {
              timeline.fromTo(span, { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: i, ease: 'power3.out' }, 'scene2');
            }
          }
          timeline.fromTo( $earthSatsOverlayIn, { opacity: 0, y: 200 }, { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: 'Power1.easeOut' }, 'scene2');
          timeline.fromTo( $earthSatsLeoIn, { opacity: 0, y: 150 }, { opacity: 1, y: 0, duration: 1, delay: 0.9, ease: 'Power1.easeOut',
            onUpdate: () => { 
              // $earthSatsLeo.classList.contains('on') && $earthSatsLeo.classList.remove('on');
              $earthSats.classList.contains('on') && $earthSats.classList.remove('on');
            }
          }, 'scene2');

          // scene3
          timeline.fromTo( $textsChild[1], { opacity: 1, y: 0 }, { opacity: 0, y: -100, duration: 1, ease: 'Power1.easeIn' }, 'scene3');
          timeline.to( $earthSatsOverlayIn, { opacity: 0, y: -areaHeight/3, duration: 1, ease: 'Power1.easeIn' }, 'scene3');
          timeline.to( $earthSatsLeoIn, { y: !isTablet ? -areaWidth*0.1328 : -areaHeight*0.2, duration: 1, ease: 'Power1.easeIn' }, 'scene3');
          timeline.to( $earth, { ...getEarthPositionAndScale($earthVisuals[2]), duration: 1, ease: 'Power1.easeIn' }, 'scene3');
          timeline.fromTo( $earthSatsServices[0], { opacity: 0 }, { opacity: 1, duration: 1, ease: 'Power1.easeOut' }, 'scene3');
          // timeline.fromTo( $earthSatsServices[1], { opacity: 0, y: -100 }, { opacity: 1, y: 0, duration: 1, ease: 'Power1.easeOut' }, 'scene3');
          timeline.fromTo( $earthSatsServices[1], { opacity: 0 }, { opacity: 1, duration: 1, ease: 'Power1.easeOut' }, 'scene3');
          // timeline.fromTo( $earthSatsGround, { opacity: 0, y: areaHeight/3, scale: 1.3 }, { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'Power1.easeOut' }, 'scene3');
          timeline.fromTo( $earthSatsGround, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'Power1.easeOut' }, 'scene3');
          timeline.fromTo( $earthSatsText, { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, ease: 'Power1.easeOut',
            onUpdate: () => {
              if (!lottieStation.isPaused) {
                resetLottie(lottieStation);
                resetLottie(lottieInternet1);
                resetLottie(lottieInternet2);
                resetLottie(lottieInternet3);
              }
            }, 
            onComplete: () => {
              !$earthSats.classList.contains('on') && $earthSats.classList.add('on');

              if (lottieStation.isPaused) {
                lottieStation._resetted = false;
                lottieStation.play();

                lottieInternet1._resetted = false;
                lottieInternet1.play();

                lottieInternet2._resetted = false;
                lottieInternet2.play();

                lottieInternet3._resetted = false;
                lottieInternet3.play();
              }
            }, 
          }, 'scene3');

          // scene4
          timeline.to( $earthSatsText, { y: -100, duration: 1, delay: 1, ease: 'Power1.easeIn' }, 'scene4');
          timeline.fromTo( $earthSats, { opacity: 1 }, { opacity: 0, duration: 1, delay: 1, ease: 'Power1.easeIn' }, 'scene4');
          // timeline.to( $stars, { scale: 1, y: 0, duration: 1, delay: 1, ease: 'Power2.easeOut' }, 'scene4');
          timeline.to( $earth, { ...getEarthPositionAndScale($earthVisuals[1]), duration: 1, delay: 1, ease: 'Power1.easeIn',
            onUpdate: () => {
              if (lottieStation.isPaused) {
                lottieStation._resetted = false;
                lottieStation.play();

                lottieInternet1._resetted = false;
                lottieInternet1.play();

                lottieInternet2._resetted = false;
                lottieInternet2.play();

                lottieInternet3._resetted = false;
                lottieInternet3.play();
              }
            }, 
            onComplete: () => {
              $earthSats.classList.contains('on') && $earthSats.classList.remove('on');
            }
          }, 'scene4');

          // scene5
          for (let i = 0; i < $textsChild[2].children.length; i++) {
            const span = $textsChild[2].children[i];
            if ( span.tagName == 'SPAN' ) {
              timeline.fromTo(span, { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' });
            }
          }
        }

        const createTimelineMobile = function () {
          const satsMinHeight = 680;
          $earthSatsGround.querySelector('.station').style.setProperty('--station-deg', (90 - (Math.atan((areaHeight*0.7 - 210) / 60) * 180 / Math.PI)) + 'deg');

          timeline && timeline.kill();
          // resetNodes($roadmap);
          const version = isTablet ? 'mobile' : 'web';
          if ( timeline && timeline.version !== version ) {
            for (let i = 0; i < timeline.getChildren().length; i++) {
              const elem = timeline.getChildren()[i];
              if ( elem._targets[0].tagName ) {
                gsap.set(elem._targets[0], { clearProps: true });
              }
            }
          }
          
          timeline = gsap.timeline({ paused: true });
          timeline.version = 'mobile';

          // scene1 - connect the future
          timeline.fromTo($textsChild[0], { opacity: 0, y: '100%' }, { opacity: 1, y: 0, duration: 1, ease: 'Power1.easeOut' }, 'scene1');
          timeline.fromTo($earthVisuals[0], { opacity: 0, }, { opacity: 1, duration: 1, ease: 'Power1.easeOut',
            onUpdate: () => { controlVideo($earthVisuals[0].querySelector('video'), 'play'); },
          }, 'scene1');
          timeline.to($textsChild[0], { opacity: 0, y: -100, duration: 1, ease: 'Power1.easeIn' }, 'scene1out');
          timeline.to($earthVisuals[0], { opacity: 0, duration: 0.5, delay: 0.5, ease: 'Power1.easeIn', 
            onUpdate: () => { controlVideo($earthVisuals[0].querySelector('video'), 'play'); },
            onComplete: () => { controlVideo($earthVisuals[0].querySelector('video'), 'pause'); } 
          }, 'scene1out');

          // scene2 - 초연결 초지능
          timeline.fromTo( $stars, { scale: 1, y: 0, }, { scale: 2, y: areaHeight/2, duration: 3, ease: 'Power2.easeOut' }, 'scene2');
          timeline.fromTo( $earth, getEarthPositionAndScale($earthVisuals[0]), { ...getEarthPositionAndScale($earthVisuals[1]), duration: 3, ease: 'Power1.easeOut', }, 'scene2');
          for (let i = 0; i < $textsChild[1].children.length; i++) {
            const span = $textsChild[1].children[i];
            if ( span.tagName == 'SPAN' ) {
              timeline.fromTo(span, { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: i, ease: 'power3.out' }, 'scene2');
            }
          }
          timeline.fromTo( $earthSatsOverlayIn, { opacity: 0, y: 200 }, { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: 'Power1.easeOut' }, 'scene2');
          timeline.fromTo( $earthSatsLeoIn, { opacity: 0, y: 150 }, { opacity: 1, y: 0, duration: 1, delay: 0.9, ease: 'Power1.easeOut',
            onUpdate: () => { $earthSats.classList.contains('on') && $earthSats.classList.remove('on'); }
          }, 'scene2');

          // scene3
          timeline.fromTo( $textsChild[1], { opacity: 1, y: 0 }, { opacity: 0, y: -100, duration: 1, ease: 'Power1.easeIn' }, 'scene3');
          timeline.to( $earthSatsOverlayIn, { opacity: 0, duration: 1, ease: 'Power1.easeIn' }, 'scene3');
          timeline.to( $earthSatsLeoIn, { y: -Math.max(satsMinHeight, areaHeight)*0.2, duration: 1, ease: 'Power1.easeIn' }, 'scene3');
          timeline.to( $earth, { ...getEarthPositionAndScale($earthVisuals[2]), duration: 1, ease: 'Power1.easeIn' }, 'scene3');
          timeline.fromTo( $earthSatsGrounds, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'Power1.easeOut' }, 'scene3');
          timeline.fromTo( $earthSatsText, { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, ease: 'Power1.easeOut',
            onComplete: () => { !$earthSats.classList.contains('on') && $earthSats.classList.add('on'); }, 
          }, 'scene3');

          // scene4
          timeline.to( $earthSatsText, { y: -100, duration: 1, delay: 1, ease: 'Power1.easeIn' }, 'scene4');
          timeline.fromTo( $earthSats, { opacity: 1 }, { opacity: 0, duration: 1, delay: 1, ease: 'Power1.easeIn' }, 'scene4');
          timeline.to( $stars, { scale: 1, y: 0, duration: 1, delay: 1, ease: 'Power2.easeOut' }, 'scene4');
          timeline.to( $earth, { ...getEarthPositionAndScale($earthVisuals[1]), duration: 1, delay: 1, ease: 'Power1.easeIn',
          onUpdate: () => { !$earthSats.classList.contains('on') && $earthSats.classList.add('on'); },
            onComplete: () => { $earthSats.classList.contains('on') && $earthSats.classList.remove('on'); }
          }, 'scene4');

          // scene5
          timeline.fromTo($textsChild[2], { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' });
        }
      })();



      state.on('leave', () => {
        console.log('_satellite.js leave');
      });
    })();
});
