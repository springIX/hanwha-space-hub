/**
 * writer : cu
 * date: 2023.04.03
 * version: 1.0.0
 */
import gsap, { Cubic } from 'gsap';
import { areaHeight, areaWidth } from './common';
import * as state from './state';
import Swiper, { EffectFade, Navigation } from 'swiper';
import 'swiper/css/navigation';
import { isMobile } from './util';


state.on('enter', () => {
  document.querySelector('main.launch') && (() => {
    const $main = document.querySelector('main.launch');
    let isTablet = false;
    
    state.on('resize', (areaWidth, areaHeight) => {
      isTablet = areaWidth > 1023 ? false : true;
    });

    // vision
    (() => {
      const $vision = $main.querySelector('.vision');

      // intro
      (() => {
        const $intro = $vision.querySelector('.intro');
        const $title = $intro.querySelector('.title');
        const $texts = $intro.querySelectorAll('.texts p');
        const $bg = $vision.querySelector('.bg');
        const $video = $vision.querySelector('video');
        const $sourceby = $vision.querySelector('.sourceby');

        let timeline, introHeight;
  
        state.on('mediachange', (media) => {
          createTimeline();
        });
        state.on('resize', (areaWidth, areaHeight) => {
          introHeight = $intro.offsetHeight - areaHeight;
        });
        state.on('scroll', (scrollTop) => {
          const rect = $intro.getBoundingClientRect();
          if ( rect.top < areaHeight && rect.bottom > 0 ) {
            const progress = -rect.top / introHeight;
            timeline.progress(progress);
            if ($video.paused) $video.play();
          } else {
            if (!$video.paused) $video.pause();
          }
        });
  
        const createTimeline = function () {
          timeline && timeline.kill();
          timeline = gsap.timeline({ paused: true });
  
          timeline.fromTo($title, { y: 0, opacity: 1 }, { y: -100, opacity: 0, duration: 1, ease: 'cubic.in' }, 'title');
          // timeline.fromTo($sourceby, { opacity: 1 }, { opacity: 0, duration: 1, ease: 'cubic.in' }, 'title');
          for (let i = 0; i < $texts.length; i++) {
            const item = $texts[i];
            
            if ( i === $texts.length - 1 ) {
              timeline.fromTo(item, { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' });
              timeline.fromTo(item.children[0], { opacity: 1 }, { opacity: 0.2, duration: 1, }, 'span');
              timeline.fromTo(item.children[1], { opacity: 0.2 }, { opacity: 1, duration: 1, }, 'span');
              timeline.to(item, { y: -100, opacity: 0, duration: 1, ease: 'cubic.in' });
              timeline.fromTo($bg, { opacity: 1 }, { opacity: 0, duration: 1, ease: 'cubic.in' });
            } else if ( item.children.length > 0 ) {
              for (let j = 0; j < item.children.length; j++) {
                const span = item.children[j];
                if ( span.tagName == 'SPAN' ) {
                  timeline.fromTo(span, { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' });
                }
              }

              if ( i === $texts.length - 1 ) return;
              timeline.to(item, { y: -100, opacity: 0, duration: 1, ease: 'cubic.in' });
            } else {
              timeline.fromTo(item, { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' });
              timeline.to(item, { y: -100, opacity: 0, duration: 1, ease: 'cubic.in' });
            }
          }
        }
      })();
    })();
    
    // history
    (() => {
      const $history = $main.querySelector('.history');
      const $title = $history.querySelector('.title');
      const $lists = $history.querySelector('.lists');
      const $listIn = $history.querySelector('.lists .inwrap');
      const $listItems = $history.querySelectorAll('.list');
      const $svgs = $history.querySelectorAll('.list svg');

      let historyHeight, historyTop;
      let timeline, timelineIntro, timelineMob;
      let slider, slideActIdx, slidePrevIdx, slideRange;
      let progress, scrollArea;

      let variables = { clip: [], path: [], text: [] };
      let imageScale = 1;
      let accordionScale = 1;
      let currentSlide = 0;

      let isSlideChnaging = false;
      let slideTimeout;

      state.on('mediachange', (media) => {
      });

      state.on('resize', (areaWidth, areaHeight) => {
        historyTop = $history.offsetTop;
        historyHeight = $history.offsetHeight - areaHeight * 2;
        accordionScale = areaWidth > 1439 ? 0.6 : 0.4;

        if ( !isTablet ) {
          setWeb();
        } else {
          setMobile();
        }
      });
      
      state.on('scroll', (scrollTop) => {
        const rect = $history.getBoundingClientRect();
        if ( rect.top < areaHeight && rect.bottom > 0 ) {
          scrollArea = isTablet ? (historyHeight + areaHeight) : historyHeight;
          progress = -rect.top  / scrollArea;

          if ( isTablet ) {
            // 모바일 - 해당 슬라이드 애니메이션 실행
            if ( progress >= 0 && progress <= 1 ) {
              slideActIdx = slider.activeIndex;
              timelineMob[slideActIdx].paused() && timelineMob[slideActIdx].paused( false );

              if ( slideActIdx !== 0 ) {
                $title.classList.add('hide');
              } else {
                $title.classList.remove('hide');
              }
            }

            // 모바일 - 스크롤따라서 슬라이드 변경
            slideRange = 1 / $listItems.length;
            if ( !isSlideChnaging ) {
              for (let i = 0; i < $listItems.length; i++) {
                if ( progress > slideRange * i && progress < slideRange * (i + 1) ) {
                  if ( currentSlide == i ) return;
                  slider.slideTo(i);
                  currentSlide = i;
                }
              }
              if ( progress > 1 ) {
                slider.slideTo($listItems.length - 1);
              } 
            }
          } else {
            // 웹 - 스크롤 timeline 실행
            const progressIntro = (-rect.top / areaHeight) + 1;
            timelineIntro && timelineIntro.progress(progressIntro);
            timeline && timeline.progress(progress);

            if ( progress > -0.15 && !$listItems[0].classList.contains('on') )  {
              $listItems[0].classList.add('on');
            } else if ( progress < -0.15 && $listItems[0].classList.contains('on') ) {
              $listItems[0].classList.remove('on');
            }
          }
        } else {
          // 웹 - class 초기화
          $history.classList.contains('before') && $history.classList.remove('before'); 
          // $history.querySelector('.list.on') && $history.querySelector('.list.on').classList.remove('on'); 

          // 모바일 - slide 있으면 초기화
          if ( slider && !slider.destroyed ) {
            const slideActIdx = slider.activeIndex;
            if ( rect.top < areaHeight ) {
              slider.slideTo($listItems.length - 1);
            }
            if ( timelineMob[slideActIdx] && !timelineMob[slideActIdx].paused() ) {
              timelineMob[slideActIdx].paused( true );
              timelineMob[slideActIdx].progress( 0 );
            };
          }
        }
      });

      const setWeb = function () {
        if ( !$lists.classList.contains('swiper') && timelineIntro ) return;

        if ( timelineMob ) {  
          for (let i = 0; i < $listItems.length; i++) {
            timelineMob[i] && timelineMob[i].kill();
          }
        }

        if ( $lists.classList.contains('swiper') ) {
          const buttonPrev = $history.querySelector('.slide-nav.prev');
          const buttonNext = $history.querySelector('.slide-nav.next');

          $lists.classList.remove('swiper');
          $listIn.classList.remove('swiper-wrapper');
          $listItems.forEach((item) => {
            item.classList.remove('swiper-slide');
          });
          buttonPrev.remove();
          buttonNext.remove();

          slider && slider.destroy();
        }

        createTimelineWeb();
      }

      const setMobile = function () {
        if ( !$lists.classList.contains('swiper') ) {
          const speed = 1000;

          timeline && timeline.kill();
          timelineIntro && timelineIntro.kill();

          // set Slide
          const buttonPrev = document.createElement('div');
          const buttonNext = document.createElement('div');
          buttonPrev.classList.add('slide-nav', 'prev');
          buttonNext.classList.add('slide-nav', 'next');

          $lists.classList.add('swiper');
          $listIn.classList.add('swiper-wrapper');
          $listItems.forEach((item) => {
            item.classList.add('swiper-slide');
          });
          $lists.append(buttonPrev, buttonNext);
          
          slider = new Swiper('.history .swiper', {
            modules: [Navigation],
            speed: speed,
            navigation: {
              prevEl: ".history .slide-nav.prev",
              nextEl: ".history .slide-nav.next",
            },
            on: {
              slideChange: () => {
                slideActIdx = slider.activeIndex;
                slidePrevIdx = slider.previousIndex;
                
                // animation 실행
                timelineMob[slideActIdx].paused( false );
                if ( slideActIdx !== 0 ) {
                  $title.classList.add('hide');
                } else {
                  $title.classList.remove('hide');
                }

                // animation - active, prev 슬라이드 아니면 초기화
                for (let i = 0; i < Object.keys(timelineMob).length; i++) {
                  if ( i !== slideActIdx && i !== slidePrevIdx ) {
                    const item = timelineMob[i];
                    if ( item.progress() !== 0 ) {
                      item.paused( true );
                      item.progress( 0 );
                    }
                  }
                }

                // 슬라이드 변경되는 동안 스크롤로 슬라이드 변경 막기
                isSlideChnaging = true;
                slideTimeout && clearTimeout(slideTimeout);
                slideTimeout = setTimeout(() => {
                  isSlideChnaging = false;
                  clearTimeout(slideTimeout);
                }, speed);

                // scroll top 값 이동
                if ( progress > (slideActIdx+1) * slideRange || progress < slideActIdx * slideRange ) {
                  if ( progress > 1 && slideActIdx == $listItems.length - 1 ) return;

                  const behavior = progress > 1 || progress < 0 ? 'smooth' : 'instant';
                  window.scrollTo({ top: scrollArea * slideRange * slideActIdx + historyTop, behavior: behavior });
                }
              },
              slideChangeTransitionEnd: () => {
                // animation - prev 는 슬라이드 전환되고 나서 초기화
                timelineMob[slidePrevIdx].paused( true );
                timelineMob[slidePrevIdx].progress( 0 );
              }
            }
          });

          createTimelineMobile();
        }

        // 그래픽 이미지, 화면에 맞춰서 줄이기
        for (let i = 0; i < $listItems.length; i++) {
          const $info = $listItems[i].querySelector('.info');
          const $infoTitle = $info.querySelector('.info-title');
          const $infoDesc = $info.querySelector('.info-desc');
          const $image = $listItems[i].querySelector('.image');

          const infoStyle = getComputedStyle($info);
          const infoHeight = $info.offsetHeight;
          const paddingHeight = parseInt(infoStyle.paddingTop) + parseInt(infoStyle.paddingBottom);
          const contentsHeight = $infoTitle.offsetHeight + $infoDesc.offsetHeight;
          const imageHeight = $image.offsetHeight;
          
          const imageArea = infoHeight - paddingHeight - contentsHeight - 40;

          // -- 해당 요소만 줄이기
          if ( imageArea < imageHeight ) {
            imageScale = Math.min(imageScale, imageArea / imageHeight);
            $image.style.transform = `scale(${imageScale})`
          } else {
            $image.style.transform = `scale(1)`
          }
        }

        // -- 전체적으로 줄이기
        // for (let i = 0; i < $listItems.length; i++) {
          // const $image = $listItems[i].querySelector('.image');
          // $image.style.transform = `scale(${imageScale})`;
        // }
      }

      const createTimelineWeb = function () {
        const lineScaleY = { value: 0 };
        
        // timelineIntro
        timelineIntro && timelineIntro.kill();
        timelineIntro = gsap.timeline({ paused: true });
        timelineIntro.fromTo(lineScaleY, {value: 0}, { value: 1,  duration: 1, ease: 'Power1.easeIn',
          onUpdate: () => { 
            !$history.classList.contains('before') && $history.classList.add('before');
            $history.style.setProperty(`--line-scaleY`, lineScaleY.value );
          }, 
          onComplete: () => { 
            $history.classList.contains('before') && $history.classList.remove('before'); 
          }   
        });

        // timeline
        timeline && timeline.kill();
        timeline = gsap.timeline({ paused: true });
        for (let i = 0; i < $listItems.length; i++) {
          const $item = $listItems[i];
          const $paths = $item.querySelectorAll('svg path');
          const $graphic = $item.querySelector('.graphic');
          const $image = $item.querySelector('.image');
          const $imageInfo = $item.querySelector('.image-info');
          
          variables.clip.push(`--svg-${i}-path-clip`);
          variables.path.push(`--svg-${i}-path-opacity`);
          variables.text.push(`--svg-${i}-text-opacity`);

          const clipTop = { value: '0%' };
          const pathOpacity = { value: 0 };
          const textOpacity = { value: 0 };
          
          const delay = i == 0 ? 0 : 0.6;

          $graphic.style = '';
          $image.style = '';

          for (let j = 0; j < $paths.length; j++) {
            const $path = $paths[j];
            const pathLength = Math.ceil($path.getTotalLength());

            $path.style = '';

            if ( getComputedStyle($path).strokeDasharray == 'none' ) {
              $path.style.strokeDasharray = pathLength;
              $path.style.strokeDashoffset = pathLength;
              
              timeline.fromTo($path, { strokeDashoffset: `${pathLength}px` }, { strokeDashoffset: `${(pathLength * 2)}px`, duration: 1, delay: delay, ease: 'Power2.easeInOut' }, `num${i-1}-2`);
            }
          }
          timeline.fromTo(clipTop,  {value: '0%'}, { value: '150%', duration: 1,  delay: delay,  ease: 'Power2.easeIn', onUpdate: () => { $history.style.setProperty(`--svg-${i}-path-clip`, clipTop.value ) } }, `num${i-1}-2`);
          timeline.fromTo(pathOpacity, {value: 0}, { value: 1,      duration: 1,  delay: delay,  ease: 'Power4.easeIn', onUpdate: () => { $history.style.setProperty(`--svg-${i}-path-opacity`, pathOpacity.value ) } }, `num${i-1}-2`);
          timeline.fromTo(textOpacity, {value: 0}, { value: 1,      duration: .3,                ease: 'Power4.easeOut', onUpdate: () => { $history.style.setProperty(`--svg-${i}-text-opacity`, textOpacity.value ) } }, `num${i}-1`);

          if ( i !== $listItems.length - 1 ) {
            const $next = $listItems[i + 1];

            timeline.to($graphic,   { width: "11%", duration: 1, delay: .4, ease: 'Circ.easeInOut' }, `num${i}-2`);
            timeline.fromTo($image, { scale: 1 }, { scale: accordionScale, duration: 1, delay: .4, ease: 'Circ.easeInOut' }, `num${i}-2`);
            timeline.fromTo($imageInfo, { opacity: 1 }, { opacity: 0, duration: 1, delay: .4, ease: 'Circ.easeInOut', 
              onUpdate: () => { 
                $next.classList.contains('on') && $next.classList.remove('on');
                $item.classList.contains('end') && $item.classList.remove('end');
              }, 
              onComplete: () => { 
                $next.classList.add('on'); 
                $item.classList.add('end');
                !$item.classList.contains('on') && $item.classList.add('on');
              }
            }, `num${i}-2`);
            timeline.fromTo($next, { opacity: 0 }, { opacity: 1, duration: .5, delay: .6, ease: 'Power2.easeInOut' }, `num${i}-2`);

            if( i == 0 ) {
              timeline.fromTo($title, { y: 0 }, { y: -100, opacity: 0, duration: .3, delay: 1, }, `num0-2`);
            }
          }
        }
      }

      const createTimelineMobile = function () {
        timelineMob = {};

        $title.style = '';

        for (let i = 0; i < $listItems.length; i++) {
          const $item = $listItems[i];
          const $image = $item.querySelector('.image');
          const $paths = $item.querySelectorAll('svg path');
          
          variables.clip.push(`--svg-${i}-path-clip`);
          variables.path.push(`--svg-${i}-path-opacity`);
          variables.text.push(`--svg-${i}-text-opacity`);

          const clipTop = { value: '0%' };
          const pathOpacity = { value: 0 };
          const textOpacity = { value: 0 };

          $image.style = '';

          timelineMob[i] && timelineMob[i].kill();
          timelineMob[i] = gsap.timeline({ paused: true });

          timelineMob[i].fromTo($image, { opacity: 0 }, { opacity: 1, duration: .3, ease: 'Power1.easeOut' }, 0);

          for (let j = 0; j < $paths.length; j++) {
            const $path = $paths[j];
            const pathLength = Math.ceil($path.getTotalLength());

            $path.style = '';

            if ( getComputedStyle($path).strokeDasharray == 'none' ) {
              $path.style.strokeDasharray = pathLength;
              $path.style.strokeDashoffset = pathLength;
              timelineMob[i].fromTo($path, { strokeDashoffset: `${pathLength}px` }, { strokeDashoffset: `${(pathLength * 2)}px`, duration: 1.5, ease: 'Power2.easeInOut' }, 0);
            }
          }

          timelineMob[i].fromTo(clipTop, {value: '0%'}, { value: '150%', duration: 1.5, ease: 'Power2.easeInOut', onUpdate: () => { $history.style.setProperty(`--svg-${i}-path-clip`, clipTop.value ) } }, 0);
          timelineMob[i].fromTo(pathOpacity, {value: 0},    { value: 1,  duration: .8, delay: .7, ease: 'Power1.easeOut', onUpdate: () => { $history.style.setProperty(`--svg-${i}-path-opacity`, pathOpacity.value ) } }, 0);
          timelineMob[i].fromTo(textOpacity, {value: 0},    { value: 1,  duration: .8, delay: .7, ease: 'Power1.easeOut', onUpdate: () => { $history.style.setProperty(`--svg-${i}-text-opacity`, textOpacity.value ) } }, 0);
        }
      }
    })();

    // introduce  
    (() => {
      const $introduce = $main.querySelector('.introduce');
      const $intro = $introduce.querySelector('.intro');

      const $models = $introduce.querySelector('.models');
      const $modelsSticky = $introduce.querySelector('.models .sticky');
      const $model = $introduce.querySelector('.model');
      const $modelIn = $introduce.querySelector('.model-in');

      const $heading = $introduce.querySelector('.heading');
      const $headingInwrap = $introduce.querySelector('.heading .inwrap');
      const $titles = $introduce.querySelector('.titles');
      const $count = $introduce.querySelector('.count');
      const $countItems = $introduce.querySelectorAll('.count .item');
      const $countCnts = $introduce.querySelectorAll('.count .cnt');

      const $keyward = $introduce.querySelector('.keyward');
      const $texts = $introduce.querySelectorAll('.texts .item');
      
      const $info = $introduce.querySelector('.info');
      const $infoInwrap = $introduce.querySelector('.info .inwrap');
      
      let timeline, progress;
      let timelineInfo, progressInfo;
      let introduceHeight, infoHeight, animationHeight, modelHeight;
      let isCouting;

      const modelInOpacity = { value: 0 };
      const modelOutOpacity = { value: 1 };
      const modelHighOpacity = { value: 0 };
      const modelHigh2Opacity = { value: 0 };

      const highlightingPin = [ 0.198, 0.533, 0.812, 0.965 ];
      let headingGap, headingMove, headingToY;
      let infoLeftHeight, infoInStyle, infoInHeight, infoInPaddingTop, infoInPaddingBtt, infoToScale, infoToY, infoGapInMob;
      let isTextOver, textGap, textFromY, textToY;
  
      state.on('mediachange', (media) => {
        createCount();
      });
      state.on('resize', (areaWidth, areaHeight) => {
        resize();

        if ( progress > 0.15 ) {
          isCouting = false;
        }
      });
      state.on('scroll', (scrollTop) => {
        const rect = $introduce.getBoundingClientRect();
        if ( rect.top < areaHeight && rect.bottom > 0 ) {
          progress = -rect.top / animationHeight;
          timeline.progress(progress);

          // count
          if ( progress > -$headingInwrap.offsetHeight/2/animationHeight )  {
            if ( !isCouting ) {
              for (let i = 0; i < $countItems.length; i++) {
                const $item = $countItems[i];
                const $itags = $item.querySelectorAll('i');

                $item.classList.add('on');
                for (let j = 0; j < $itags.length; j++) {
                  const $itag = $itags[j];
                  $itag.tween && $itag.tween.kill();
                  $itag.tween = gsap.fromTo($itag, { y: 0 }, { y: -$itag.getBoundingClientRect().height * ($itags.length - 1), duration: 2, ease: 'Power3.easeOut'});
                }
              }
              
              isCouting = true;
              !$modelIn.classList.contains('on') && $modelIn.classList.add('on');
            }
          }

          // info
          const rectInfo = $info.getBoundingClientRect();
          if ( rectInfo.top < areaHeight*0.3 && rectInfo.bottom > 0 ) {
            !$info.classList.contains('on') && $info.classList.add('on');
            !$model.classList.contains('on') && $model.classList.add('on');
          } else if ( rectInfo.top > areaHeight*0.3 ) {
            $info.classList.contains('on') && $info.classList.remove('on');
            $model.classList.contains('on') && $model.classList.remove('on');
          }

        } else {
          isCouting = false;
          $countItems.forEach((item) => item.classList.remove('on'));
          $modelIn.classList.contains('on') && $modelIn.classList.remove('on');

          if ( rect.top > areaHeight ) {
            $introduce.style.setProperty(`--model-outside-opacity`, 1 );
          }
        }

        if ( !isTablet ) {
          const rectInfo = $info.getBoundingClientRect();
          if ( rectInfo.top < areaHeight && rectInfo.bottom > 0 ) {
            progressInfo = -rectInfo.top / (infoHeight-areaHeight);
            timelineInfo.progress(progressInfo);
          }
        }
      });

      const resize = function () {
        introduceHeight = $introduce.offsetHeight - areaHeight;
        animationHeight = $intro.offsetHeight - areaHeight;
        infoHeight = $info.offsetHeight;
        modelHeight = $model.offsetHeight;

        createTimeline();

        if ( $count.querySelector('i') ) {
          for (let i = 0; i < $countCnts.length; i++) {
            const item = $countCnts[i];
            item.style.maxHeight = item.querySelector('i').offsetHeight  + 'px';
          }
        }

        $infoInwrap.style.paddingBottom = ``;
        if ( areaWidth > 1440 && areaHeight >= 1080 && $infoInwrap.offsetHeight > areaHeight ) {
          $infoInwrap.style.paddingBottom = `${200 - ($infoInwrap.offsetHeight-areaHeight)}px`;
        }
      }

      const createTimeline = function () {
        // values
        headingGap = areaHeight - $headingInwrap.offsetHeight;
        headingToY = modelHeight * highlightingPin[0] + areaHeight/2;
        // headingToY = modelHeight*highlightingPin[0]+areaHeight/2 < areaHeight+headingGap ? (modelHeight*highlightingPin[0]+areaHeight/2) : areaHeight;

        infoLeftHeight = $info.querySelector('.info-left').offsetHeight;
        infoInStyle = getComputedStyle($infoInwrap);
        infoInHeight = parseInt(infoInStyle.height);
        infoInPaddingTop = parseInt(infoInStyle.paddingTop);
        infoInPaddingBtt = parseInt(infoInStyle.paddingBottom);
        infoGapInMob = isTablet ? Math.max(0, infoInHeight - areaHeight) : 0; 

        infoToScale = !isTablet ? Math.min(0.215, ((infoInHeight - infoInPaddingTop - infoInPaddingBtt) / modelHeight)) : infoLeftHeight / modelHeight;
        const modelRenderHeight = modelHeight * infoToScale;
        infoToY = !isTablet ? -modelRenderHeight - infoInPaddingBtt + Math.max(0, (infoInHeight - areaHeight)) : -infoInHeight + infoInPaddingTop - 50;
        // infoToY = !isTablet ? -modelRenderHeight - infoInPaddingBtt : -areaHeight + infoInPaddingTop - 50;

        // set modelsheight
        if ( isTablet ) {
          $modelsSticky.style.height = '';
          $modelsSticky.style.height = infoInHeight + 'px';
        } else {
          $modelsSticky.style.height = '';
        }

        timeline && timeline.kill();
        timeline = null;
        timeline = gsap.timeline({ paused: true });

        // heading
        timeline.fromTo($titles, { y: 0, opacity: 1 }, { y: -200, duration: .3, ease: 'Power1.easeOut' }, 'a');
        timeline.fromTo($count,  { y: 0, opacity: 1 }, { y: -200, duration: .3, ease: 'Power1.easeOut' }, 'a');
        timeline.fromTo($model, { y: -(headingGap + infoGapInMob) }, { y: -headingGap - 200 - infoGapInMob, duration: .3, ease: 'Power1.easeOut' }, 'a');
        
        timeline.to($titles, { y: ((headingGap + infoGapInMob) + -(headingToY + infoGapInMob))*0.8 , opacity: 0, duration: 1.2, ease: 'Power1.easeIn' }, 'b');
        timeline.to($count,  { y: ((headingGap + infoGapInMob) + -(headingToY + infoGapInMob)) , opacity: 0, duration: 1.2, ease: 'Power1.easeIn' }, 'b');
        timeline.to($model, {  y: -(headingToY + infoGapInMob), duration: 1.2, ease: 'Power1.easeIn' }, `b`);
        timeline.fromTo(modelOutOpacity, { value: 1 }, { value: 0, delay: 0.6, duration: 0.6, ease: 'Power0.easeNone', onUpdate: () => { $introduce.style.setProperty(`--model-outside-opacity`, modelOutOpacity.value ) } }, 'b');
        // timeline.to($model,  { y: -headingToY - (headingGap + infoGapInMob), duration: 1, ease: 'Power1.easeIn' }, 'b');
        // timeline.fromTo(modelOutOpacity, { value: 1 }, { value: 0, duration: .8, ease: 'Power0.easeNone', onUpdate: () => { $introduce.style.setProperty(`--model-outside-opacity`, modelOutOpacity.value ) } }, '0-0');

        // keyward
        for (let i = 0; i < $texts.length; i++) {
          const $text = $texts[i];
          const $lis = $texts[i].querySelectorAll('li');
          const highlightData = i == 2 ? modelHigh2Opacity : modelHighOpacity;
          const highlightStyle = i == 2 ? '--model-highlights2-opacity' : '--model-highlights-opacity';

          isTextOver = $text.offsetHeight > areaHeight;

          textGap = $text.offsetHeight - areaHeight;
          textFromY = isTextOver ? 100 + textGap : 100;
          textToY = isTextOver ? textGap : 0;

          $text.style = ``;
          $lis.forEach(($li) => { $li.style = `` });
          
          // timeline
          if ( i !== 0 ) {
            timeline.fromTo($model, { scale: 1 }, { y: -(modelHeight*highlightingPin[i]) - areaHeight/2 - (i==3 ? modelHeight*0.3 : 0) - infoGapInMob, scale: (i==3 ? 1.3 : 1), dealy: 0.5, duration: (i==3 ? 1 : 1.5), ease: 'Power1.easeInOut' }, `${i}-0`);
          }
          timeline.fromTo(highlightData, { value: 0 }, { value: 1, duration: 0.7, ease: 'Power1.easeOut', onUpdate: () => { $introduce.style.setProperty(highlightStyle, highlightData.value ) } }, `${i}-1`);
          if ( i == 1 ) {
            for (let j = 0; j < $lis.length; j++) {
              const $li = $lis[j];
              const delay = j > 1 && !isTablet ? .1 : 0;
              timeline.fromTo($li, { opacity: 0, y: textFromY }, { opacity: 1, y: textToY, delay: 0.3 + delay, duration: 0.7, ease: 'Power1.easeOut' }, `${i}-1`);
            }
          } else {
            timeline.fromTo($texts[i], { opacity: 0, y: textFromY }, { opacity: 1, y: textToY, delay: 0.3, duration: 0.7, ease: 'Power1.easeOut' }, `${i}-1`);
          }

          if ( isTextOver ) {
            timeline.to($texts[i], { y: textToY - textGap - 50, duration: .5, ease: 'Power1.easeOut' }, `${i}-scroll`);
          }

          if ( i == 1 ) { // i==1 은 texts[i]로 이동시키는것이 안됨
            for (let j = 0; j < $lis.length; j++) {
              const $li = $lis[j];
              timeline.to( $li, { opacity: 0, y: -areaHeight/4, duration: .5, ease: 'Power1.easeIn' }, `${i+1}-0`);
            }
          } else {
            timeline.to( $texts[i], { opacity: 0, y: -areaHeight/4, duration: .5, ease: 'Power1.easeIn' }, `${i+1}-0`);
          }

          timeline.to(highlightData, { value: 0, duration: .5, ease: 'Power0.easeNone', onUpdate: () => { $introduce.style.setProperty(highlightStyle, highlightData.value ) } }, `${i+1}-0`);
        }

        // info
        timeline.to($model, { y: infoToY, scale: infoToScale, duration: 1.5, ease: 'Power1.easeOut' }, `${$texts.length}-0`);
        timeline.to(modelOutOpacity, { value: 1, duration: 1.2, ease: 'Power0.easeNone', 
          onUpdate: () => { $introduce.style.setProperty(`--model-outside-opacity`, modelOutOpacity.value ) }, 
          onComplete: () => { !$model.classList.contains('on') && $model.classList.add('on'); } 
        }, `${$texts.length}-0`);

        // timeline.to($model, { y: infoToY + areaHeight*0.5, duration: 1, ease: 'Power0.easeNone' });



        // info in wrap
        if ( !isTablet ) {
          timelineInfo && timelineInfo.kill();
          timelineInfo = gsap.timeline({ paused: true });
          timelineInfo.fromTo($infoInwrap, { y: 0 },{ y: Math.min(0, areaHeight - infoInHeight), duration: 1, ease: 'Power0.easeNone' }, 0);
          timelineInfo.to($model, { y: infoToY + Math.min(0, areaHeight - infoInHeight), duration: 1, ease: 'Power0.easeNone' }, 0);
        }
      }

      const createCount = function () {
        const countUp = function (el, time, end) {
          let endNum = end || el.innerHTML * 1 + 1;
          if ( endNum == 1 ) endNum = 10;
  
          el.innerHTML = '';
          
          for (let i = 0; i < endNum; i++) {
            const itag = document.createElement('i');
            itag.innerHTML = i;
            el.append(itag);
  
            if ( i == 9 ) {
              const itagLast = document.createElement('i');
              itagLast.innerHTML = 0;
              el.append(itagLast);
            }
          }
  
          el.style.maxHeight = el.querySelector('i').offsetHeight  + 'px';
        }

        !$countCnts[0].querySelector('i') && countUp($countCnts[0]);
        !$countCnts[1].querySelector('i') && countUp($countCnts[1]);
        !$countCnts[2].querySelector('i') && countUp($countCnts[2]);
      }
    })();

    // part 
    (() => {
      const $part = $main.querySelector('.part');
      const $slider = $part.querySelector('.swiper');
      const $slides = $slider.querySelectorAll('.swiper-slide');
      const $slideTitleLis = $slider.querySelectorAll('.titles li');
      const $video = $slider.querySelector('video');
      
      let partHeight, partTop;
      let progress, scrollArea;
      let slideRange, slideActIdx;
      let isSlideChnaging = false;
      let slideTimeout;

      state.on('mediachange', (media) => {
      });
      state.on('resize', (areaWidth, areaHeight) => {
        partTop = $part.offsetTop;
        partHeight = $part.offsetHeight;
        scrollArea = partHeight - areaHeight;
      });
      state.on('scroll', (scrollTop) => {
        const rect = $part.getBoundingClientRect();
        if ( rect.top < areaHeight && rect.bottom > 0 ) {
          progress = -rect.top / scrollArea;
            
          if ( progress > -0.7 && !$part.classList.contains('active') ) {
            $part.classList.add('active');
          } else if ( progress < -0.9 ) {
            $part.classList.remove('active');
          }

          slideRange = 1 / $slides.length;
          if ( !isSlideChnaging ) {
            for (let i = 0; i < $slides.length; i++) {
              if ( progress > slideRange * i && progress < slideRange * (i + 1) ) {
                slider.slideTo(i);
              }
            }
            if ( progress > 1 ) {
              slider.slideTo($slides.length - 1);
            } 
          } 
          
        } else {
          if (!$video.paused) $video.pause(); 
        }
      });

      const slider = new Swiper('.part .swiper', {
        modules: [Navigation, EffectFade],
        speed: 0,
        delay: 0,
        effect: 'fade',
        fadeEffect: {
          crossFade: true
        },
        navigation: {
          prevEl: ".part .slide-nav.prev",
          nextEl: ".part .slide-nav.next",
        },
        on: {
          slideChange: () => {
            slideActIdx = slider.activeIndex;
            $slider.querySelector('.titles li.on').classList.remove('on');
            $slideTitleLis[slideActIdx].classList.add('on');

            isSlideChnaging = true;
            slideTimeout && clearTimeout(slideTimeout);
            slideTimeout = setTimeout(() => {
              isSlideChnaging = false;
              clearTimeout(slideTimeout);
            }, 1000);

            if ( progress > (slideActIdx+1) * slideRange || progress < slideActIdx * slideRange ) {
              if ( progress > 1 && slideActIdx == $slides.length - 1 ) return;

              const behavior = progress > 1 || progress < 0 ? 'smooth' : 'instant';
              window.scrollTo({ top: scrollArea * slideRange * slideActIdx + partTop, behavior: behavior });
            }

            if ( slideActIdx == 1 ) {
              if ($video.paused) $video.play();
            } else {
              if (!$video.paused) $video.pause(); 
            }
          },
        }
      });
    })();

    // infra
    (() => {
      const $infra = $main.querySelector('.infra');
      const $title = $infra.querySelector('.title');
      const $text = $infra.querySelector('.text');
      const $caption = $infra.querySelector('.caption');
      const $map = $infra.querySelector('.map');
      const $mapBg = $infra.querySelector('.map .background');
      const $buildings = $infra.querySelectorAll('.buildings .item');

      let timeline, infraHeight;
      let timelineIntro;
      let translateY;

      state.on('mediachange', (media) => {
        createTimeline();
        setEvent();
      });
      state.on('resize', (areaWidth, areaHeight) => {
        $infra.dataset.focusOffset = $infra.offsetHeight - areaHeight;
        $infra.dataset.focusOffsetM = $infra.offsetHeight - areaHeight;

        infraHeight = $infra.offsetHeight - areaHeight;

        if ( isTablet && !$infra.querySelector('.cover') ) {
          createCover();
        } else if ( !isTablet && $infra.querySelector('.cover') ) {
          $infra.querySelector('.cover').remove();
        }
      });
      state.on('scroll', (scrollTop) => {
        const rect = $infra.getBoundingClientRect();
        if ( rect.top < areaHeight && rect.bottom > 0 ) {
          const progress = -rect.top / infraHeight;
          timeline.progress(progress);

          const progressIntro = progress + 1;
          timelineIntro.progress(progressIntro);

          if ( progressIntro < 1 ) {
              $infra.classList.contains('on') && $infra.classList.remove('on');
          }
        }
      });

      const createTimeline = function () {
        timeline && timeline.kill();
        timeline = gsap.timeline({ paused: true });

        translateY = isTablet ? 50 : 100;

        timeline.fromTo($title, { opacity: 0, y: translateY }, { opacity: 1, y: 0, duration: 1, ease: 'Power1.easeOut' }, 0);
        timeline.fromTo($text, { opacity: 0, y: translateY }, { opacity: 1, y: 0, delay: .1, duration: .9, ease: 'Power1.easeOut' }, 0);
        timeline.fromTo($caption, { opacity: 0, y: translateY }, { opacity: 1, y: 0, delay: .2, duration: .8, ease: 'Power1.easeOut' }, 0);


        // intro
        timelineIntro && timelineIntro.kill();
        timelineIntro = gsap.timeline({ paused: true });
        timelineIntro.fromTo($mapBg, { scale: 1.2, opacity: 0.3 }, { scale: 1, opacity: 1, duration: 1, ease: 'Power1.easeOut', 
          onComplete: () => {
            $infra.classList.add('on');
            if (!$map.dataset.building) $map.dataset.building = 0; 
          }
        } );
      }

      const createCover = function () {
        const $cover = document.createElement('div');
        const text = document.querySelector('html').lang == 'en' ? 'Explore Naro Space Center' : '나로우주센터 둘러보기';
        $cover.classList.add('cover');
        $cover.innerHTML = `<span class="text">${text}</span>`;

        $infra.querySelector('.sticky').appendChild($cover);

        $cover.addEventListener('pointerdown', () => {
          $cover.classList.add('hide');
        })
      }

      const onHoverBuilding = (e) => {
        const building = e.currentTarget;
        const id = e.currentTarget.dataset.id;
        $map.dataset.building = id;

        building.addEventListener('mouseout', onOutBuilding);
      }

      const onOutBuilding = () => {
        $map.dataset.building = 0;
      }

      const setEvent = function () {
        for (let i = 0; i < $buildings.length; i++) {
          const building = $buildings[i];
          building.addEventListener('mouseover', onHoverBuilding);
        }
      }

    })();

    // future
    (() => {
      const $future = $main.querySelector('.future');
      const $articles = $future.querySelectorAll('article');

      for (let i = 0; i < $articles.length; i++) {
        const $article = $articles[i];
        const $num = $article.querySelector('.eyebrow');
        const $title = $article.querySelector('.title');
        const $texts = $article.querySelectorAll('.text');
        const $bg = $article.querySelector('.bg');
        const $image = $article.querySelector('.image');
        const $video = $article.querySelector('video');
        
        let timeline, articleHeight;
        let translateY = 0;

        state.on('mediachange', (media) => {
          createTimeline();
        });
        state.on('resize', (areaWidth, areaHeight) => {
          articleHeight = $article.offsetHeight;
        });
        state.on('scroll', (scrollTop) => {
          const rect = $article.getBoundingClientRect();
          if ( rect.top < areaHeight && rect.bottom > 0 ) {
            const progress = (-rect.top / articleHeight) + 1;
            const progressHalfAfter = progress * 2 - 1;
            timeline.progress(progressHalfAfter);

            if ( $bg || $image ) {
              const target = $bg || $image;
              const scale = i == 0 ? 0.3 : 1.5;
              
              target.style.opacity = Math.min(1, (1 - rect.top / areaHeight) * 1.5);
              target.style.transform = 'scale(' + Math.max(1, Cubic.easeIn(Math.max(0, rect.top / areaHeight)) * scale + 1) + ')';
            }
            if ($video.paused) $video.play();
          } else {
            if (!$video.paused) $video.pause();
          }
        });

        const createTimeline = function () {
          timeline && timeline.kill();
          timeline = gsap.timeline({ paused: true });

          translateY = isTablet ? 50 : 100;

          timeline.fromTo($num, { opacity: 0, y: translateY }, { opacity: 1, y: 0, duration: 1, ease: 'Power1.easeOut' }, 'a');
          timeline.fromTo($title, { opacity: 0, y: translateY }, { opacity: 1, y: 0, duration: 1, delay: 0.15, ease: 'Power1.easeOut' }, 'a');
          for (let j = 0; j < $texts.length; j++) {
            const $text = $texts[j];
            timeline.fromTo($text, { opacity: 0, y: translateY }, { opacity: 1, y: 0, duration: 1, delay: 0.3 + j * 0.15,   ease: 'Power1.easeOut' }, 'a');
          }
        }
      }
    })();
  })();
});



