/**
 * writer : linda
 * date: 2023.04.18
 */
import gsap, { Cubic } from 'gsap';
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import * as state from './state';

import { areaWidth, areaHeight, imagePath } from './common';

state.on('enter', () => {
	document.querySelector('main.exploration') && (() => {
    gsap.registerPlugin(MotionPathPlugin);

    const $main = document.querySelector('main.exploration');
    
    // vision
		(() => {
      const $vision = $main.querySelector('.vision');
      
			// intro
			(() => {
				const $intro = $vision.querySelector('.intro');
        const $children = $vision.querySelectorAll('.intro .sticky > *:not(.video-wrap)');
        const $video = $intro.querySelector('video');
        const $dimmed = $intro.querySelector('.dimmed');
        const $moon = $intro.querySelector('.moon');
        const $earth = $intro.querySelector('.earth');
				const $ment01 = $children[1];
				const $ment02 = $children[2];
				const $ment03 = $children[3];
				const $ment04 = $children[4];
				const $ment05 = $children[5];
        
        let timeline, introHeight;
        
        const mentList = [$ment01, $ment02, $ment03, $ment04, $ment05];
        for (let i = 0; i < mentList.length; i++) {
          mentList[i].dataset.content = mentList[i].innerHTML;
        }

				state.on('scroll', (scrollTop) => {
					const rect = $intro.getBoundingClientRect();
					if (rect.top < areaHeight && rect.bottom > 0) {
						const progress = -rect.top / introHeight;
						timeline.progress(progress);
            if ($video.paused) {
              $video.play();
            }
            if ($earth.paused) {
              $earth.play();
            }
					} else if (!$video.paused) {
						$video.pause();
          } else if (!$earth.paused) {
            $earth.pause();
          }
				});

				state.on('mediachange', (media) => {
					createTimeline();
				});

				state.on('resize', (areaWidth, areaHeight) => {
          introHeight = $intro.offsetHeight - areaHeight;
          createTimeline();
				});


				function createTimeline () {
					timeline && timeline.kill();
					timeline = gsap.timeline({ paused: true });

          timeline.fromTo($children[0], { y: 0, opacity: 1 }, { y: -100, opacity: 0, duration: 1, ease: 'cubic.in' });
          
          $ment01.innerHTML = `<span>${$ment01.dataset.content.split(state.states.media === 'mobile' ? /<br(?: class="monly")?>/ : /<br(?: class="wonly")?>/).join('</span><span>')}</span>`;
          for (let i = 0, max = $ment01.children.length; i < max; i++) {
            timeline.fromTo($ment01.children[i], { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' });
          }
          timeline.fromTo($children[1], { y: 0, opacity: 1 }, { y: -100, opacity: 0, duration: 1, ease: 'cubic.in' });

          $ment02.innerHTML = `<span>${ $ment02.dataset.content.split(state.states.media === 'mobile' ? /<br(?: class="monly")?>/ : /<br(?: class="wonly")?>/).join('</span><span>') }</span>`;
					for (let i = 0, max = $ment02.children.length; i < max; i++) {
            timeline.fromTo($ment02.children[i], { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' });
          }
          timeline.fromTo($children[2], { y: 0, opacity: 1 }, { y: -100, opacity: 0, duration: 1, ease: 'cubic.in' });

          $ment03.innerHTML = `<span>${ $ment03.dataset.content.split(state.states.media === 'mobile' ? /<br(?: class="monly")?>/ : /<br(?: class="wonly")?>/).join('</span><span>') }</span>`;
					for (let i = 0, max = $ment03.children.length; i < max; i++) {
            timeline.fromTo($ment03.children[i], { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' });
          }
          timeline.fromTo($children[3], { y: 0, opacity: 1 }, { y: -100, opacity: 0, duration: 1, ease: 'cubic.in' });

          timeline.fromTo($video, { opacity: 1, scale: 1 }, { opacity: 0, scale: 2, duration: 3, ease: 'cubic.out'},'gradient_00')
          timeline.fromTo($dimmed,{ opacity: 0.26 }, { opacity: 0, duration: 2, ease: 'cubic.out'},'gradient_00')
          timeline.fromTo($moon,  {opacity: 0,  y: 500 }, {opacity: 1, y: state.states.media !== 'mobile' ? 0 : 80, delay: 1, duration: 2, ease: 'power3.out'},'gradient_00')
          timeline.fromTo($earth, { opacity: 0, y: 0 }, { opacity: 1, y: state.states.media === 'mobile' ? 0 : -80, delay: 1, duration: 2, ease: 'power3.out' }, 'gradient_00')

          // timeline.fromTo($moon, { scale: 1 }, { scale:1.5, y: 150, duration: 3, ease: 'quad.out' }, 'scrollEnlarge')
          if (state.states.media !== 'mobile') {
            timeline.fromTo($moon, { scale: 1 }, { scale:1.5, y: 150, duration: 3, ease: 'quad.out' }, 'scrollEnlarge')
            timeline.fromTo($earth, {scale: 1}, {scale: 2, duration: 4,ease: 'power3.out'},'scrollEnlarge')
          } else {
            timeline.fromTo($moon, { scale: 1, y: 80 }, { scale:1.5, y: 150, duration: 3, ease: 'quad.out' }, 'scrollEnlarge')
            timeline.fromTo($earth, { scale: 1 }, { scale:1.28, duration: 3, ease: 'quad.out' }, 'scrollEnlarge')
          }

          timeline.fromTo($children[4], { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 2, ease: 'power3.out' });
          timeline.to($children[4], { y: -100, opacity: 0, duration: 1, ease: 'cubic.in' });

          $ment05.innerHTML = `<span>${ $ment05.dataset.content.split(state.states.media === 'mobile' ? /<br(?: class="monly")?>/ : /<br(?: class="wonly")?>/).join('</span><span>') }</span>`;
					for (let i = 0, max = $ment05.children.length; i < max; i++) {
            timeline.fromTo($ment05.children[i], { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },);
          }
          timeline.fromTo($children[5], { y: 0, opacity: 1 }, { y: -100, opacity: 0, duration: 1, ease: 'cubic.in' });

          timeline.to($moon, { scale: 3, y: 300, opacity: 0, duration: 3, delay:1, ease: 'cubic.out' }, 'fadeOut')
          timeline.to($earth, {scale: 2.5, opacity: 0,  duration: 5, delay:0.75, ease: 'cubic.out'},'fadeOut')
				}
      })();

    })();
    
    //thrust
    (() => {
      (() => {
        const $thrust = $main.querySelector('.thrust');
        const $firstWrap = $thrust.querySelector('.inwrap.guide');
        const $headerFirst = $firstWrap.querySelector('.header');
        const $eyebrowFirst = $firstWrap.querySelector('.eyebrow');
        const $titleFirst = $firstWrap.querySelector('.title');
        const $textsFirst = $firstWrap.querySelectorAll('.text');
        const $imageFirst = $firstWrap.querySelector('.image');
        const $copyFirst = $firstWrap.querySelector('.copy');
        const $lottieFirst = $firstWrap.querySelector('.lottiewrap');
        // const $moonOrbit = $firstWrap.querySelector('.orbit01');
        const $moonVideo01 = $firstWrap.querySelector('.moon-video');
        const $earthVideo = $firstWrap.querySelector('.earth-video');
        
        const $secondWrap = $thrust.querySelector('.inwrap.space-hub');
        const $headerSecond = $secondWrap.querySelector('.header');
        const $eyebrowSecond = $secondWrap.querySelector('.eyebrow');
        const $titleSecond = $secondWrap.querySelector('.title');
        const $textsSecond = $secondWrap.querySelectorAll('.text');
        const $imageSecond = $secondWrap.querySelector('.image');
        const $copySecond = $secondWrap.querySelector('.copy');
        const $image = $secondWrap.querySelector('.image');
        const $moonOrbitNext = $secondWrap.querySelector('.orbit02');
        const $moonPath = $secondWrap.querySelector('.path02');
        const $moonVideo02 = $secondWrap.querySelector('video');
        const $bg = $thrust.querySelector('.bg');

        let timeline, thrustHeight;

        const $lineMotion = $firstWrap.querySelector('.satellite');
        const $ellipseMotion = $secondWrap.querySelector('.satellite');

        function pathMotionAnimations() {
          gsap.to($lineMotion, {
            duration: 9,
            repeat: -1,
            ease: "power1.inOut",
            motionPath:{
              path: '#main_line-2',
              align: '#main_line-2',
              alignOrigin: [0.5, 0.5]
            }
          })
  
          gsap.to('#rotateOrbit', {
            rotation: 360, 
            transformOrigin:"center",
            duration: 5, 
            repeat: -1,
            ease: "linear",
          })
        }
        

				state.on('scroll', (scrollTop) => {
					const rect = $thrust.getBoundingClientRect();
          if (rect.top < areaHeight && rect.bottom > 0) {
            const progress = (-(rect.top / thrustHeight) + 0.1) / 0.9;
						timeline.progress(progress);
            if ($moonVideo01.paused && $earthVideo || $moonVideo02.paused) {
              $earthVideo.play();
              $moonVideo01.play();
              $moonVideo02.play();
            }
          } else if (!$moonVideo01.paused && $earthVideo || !$moonVideo02.paused) {
            $earthVideo.pause();
						$moonVideo01.pause();
						$moonVideo02.pause();
          }
				});

				state.on('mediachange', (media) => {
          createTimeline();
          pathMotionAnimations();
				});

				state.on('resize', (areaWidth, areaHeight) => {
          thrustHeight = $thrust.offsetHeight - areaHeight;

          if (state.states.media !== 'desktop') {
            $lottieFirst.style.transform = `translate3d(0, 0, 0) scale(1)`;
            $moonVideo02.style.transform = '';
            $moonOrbitNext.style.transform = '';

            $moonVideo02.style.opacity = 1;
            $moonOrbitNext.style.opacity = 1;
          }

          if (state.states.media === 'mobile ') {
            gsap.to($ellipseMotion, {
              duration: 5, 
              repeat: -1,
              ease: "linear",
              motionPath:{
                path: '#ellipse-m',
                align: '#ellipse-m',
                autoRotate: true,
                alignOrigin: [0.5, 0.5]
              }
            })
          } else {
            gsap.to($ellipseMotion, {
              duration: 5, 
              repeat: -1,
              ease: "linear",
              motionPath:{
                path: '#ellipse',
                align: '#ellipse',
                autoRotate: true,
                alignOrigin: [0.5, 0.5]
              }
            })
          }

          createTimeline();
          pathMotionAnimations();
				});


				function createTimeline () {
					timeline && timeline.kill();
					timeline = gsap.timeline({ paused: true });

          timeline.fromTo($eyebrowFirst, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'Power1.easeOut' }, 'orbit');
          timeline.fromTo($titleFirst,   { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'Power1.easeOut' }, 'orbit');
          for (let j = 0; j < $textsFirst.length; j++) {
            const $text = $textsFirst[j];
            timeline.fromTo($text,       { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'Power1.easeOut' }, 'orbit');
          }
          timeline.fromTo($headerFirst,  { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'Power1.easeOut' }, 'orbit');
          timeline.fromTo($imageFirst,   { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'Power1.easeOut' }, 'orbit');
          timeline.fromTo($copyFirst,    { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'Power1.easeOut' }, 'orbit');
          timeline.fromTo($lottieFirst, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'Power1.easeOut' }, 'orbit');

          timeline.to($eyebrowFirst,     { y: 50, opacity: 0, duration: 1, delay:1, ease: 'Power1.easeOut' }, 'orbit01');
          timeline.to($titleFirst,       { y: 50, opacity: 0, duration: 1, delay:1, ease: 'Power1.easeOut' }, 'orbit01');
          for (let j = 0; j < $textsFirst.length; j++) {
            const $text = $textsFirst[j];
            timeline.to($text,           { y: 50,opacity: 0, duration: 1, delay:1, ease: 'Power1.easeOut' }, 'orbit01');
          }
          timeline.to($headerFirst,      { y: 50, opacity: 0, duration: 1, delay:1, ease: 'Power1.easeOut' }, 'orbit01');
          timeline.to($imageFirst,       { y: 50, opacity: 0, duration: 1, delay:1, ease: 'Power1.easeOut' }, 'orbit01');
          timeline.to($copyFirst,        { y: 50, opacity: 0, duration: 1, delay:1, ease: 'Power1.easeOut' }, 'orbit01');
          if (state.states.media !== 'mobile') {
            timeline.fromTo($lottieFirst,  { x:0, y:0, scale: 1 },{ x:-1400, y: 350, scale: 4.5, opacity: 0, duration: 0.5, delay: 1, ease: 'Power1.easeOut' }, 'orbit01');
          } else {
            timeline.to($lottieFirst,  { opacity: 0, duration: 0.5, delay: 1, ease: 'Power1.easeOut' }, 'orbit01');
          }

          timeline.fromTo($eyebrowSecond,{ y: 50, opacity: 0 }, { y: 0, opacity: 1, delay:1, duration: 1, ease: 'Power1.easeOut' }, 'orbit01');
          timeline.fromTo($titleSecond,  { y: 50, opacity: 0 }, { y: 0, opacity: 1, delay:1, duration: 1, ease: 'Power1.easeOut' }, 'orbit01');
          for (let j = 0; j < $textsSecond.length; j++) {
            const $text = $textsSecond[j];
            timeline.fromTo($text,       { y: 50, opacity: 0}, {  y: 0, opacity: 1, delay:1, duration: 1, ease: 'Power1.easeOut' }, 'orbit01');
          }
          timeline.fromTo($headerSecond, { y: 50, opacity: 0 }, { y: 0, opacity: 1, delay:1, duration: 1, ease: 'Power1.easeOut' }, 'orbit01');
          timeline.fromTo($imageSecond,  { y: 50, opacity: 0 }, { y: 0, opacity: 1, delay:1, duration: 1, ease: 'Power1.easeOut' }, 'orbit01');
          timeline.fromTo($copySecond, { y: 50, opacity: 0 }, {
            y: 0, opacity: 1, delay: 1, duration: 1, ease: 'Power1.easeOut', onComplete: function () {
              gsap.to($ellipseMotion, {
                duration: 5, 
                repeat: -1,
                ease: "linear",
                motionPath:{
                  path: state.states.media === 'mobile'? '#ellipse-m' : '#ellipse',
                  align: state.states.media === 'mobile'? '#ellipse-m' : '#ellipse',
                  autoRotate: true,
                  alignOrigin: [0.5, 0.5]
              }
          })} }, 'orbit01');
          if (state.states.media === 'desktop') {
            timeline.fromTo($moonVideo02, { x: 450, y: -300, opacity: 0, scale: 0.1 }, { x: -360, y: 60, opacity: 1, scale: 1, duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'orbit01');
            timeline.fromTo($moonOrbitNext, { x: 150, y: -900, opacity: 0, scale: 0.1 }, { x: -650, y: -740, opacity: 1, scale: 1, duration: 1, delay: 1, ease: 'Power1.easeOut' }, 'orbit01');
          }
          timeline.fromTo($ellipseMotion, {opacity: 0}, {opacity: 1, delay:1, duration: 2, ease: 'Power1.easeOut' });

          timeline.to($eyebrowSecond,     { opacity: 0, duration: 1, ease: 'Power1.easeOut' }, 'orbit02');
          timeline.to($titleSecond,       { opacity: 0, duration: 1, ease: 'Power1.easeOut' }, 'orbit02');
          for (let j = 0; j < $textsSecond.length; j++) {
            const $text = $textsSecond[j];
            timeline.to($text,            { opacity: 0, duration: 1, ease: 'Power1.easeOut' }, 'orbit02');
          }
          timeline.to($headerSecond,      { opacity: 0, duration: 1, ease: 'Power1.easeOut' }, 'orbit02');
          timeline.to($imageSecond,       { opacity: 0, duration: 1, ease: 'Power1.easeOut' }, 'orbit02');
          timeline.to($copySecond,        { opacity: 0, duration: 1, ease: 'Power1.easeOut' }, 'orbit02');
          timeline.to($image,             { opacity: 0, duration: 1, ease: 'Power1.easeOut' }, 'orbit02');
          timeline.fromTo($bg,            { scale:1.5}, { scale: 1, duration: 1, ease: 'Power1.easeOut' }, 'orbit02');
				}
      })();
    })();

    // isru
    (() => {
      (() => {
        const $isru = $main.querySelector('.isru');
        const $video = $isru.querySelector('video');
        const $title = $isru.querySelector('.title');
        const $texts = $isru.querySelectorAll('.text');
        const $basecamp = $isru.querySelector('.basecamp');
        const $quoteBox = $isru.querySelector('.quote-box');
        const $quoteStrong = $isru.querySelector('.quote-box strong');
        const $quote = $isru.querySelector('.quote');
        const $earth = $isru.querySelector('.earth');
        const $bg = $isru.querySelector('.bg');
        let timeline, isruHeight;

				state.on('scroll', (scrollTop) => {
					const rect = $isru.getBoundingClientRect();
          if (rect.top < areaHeight && rect.bottom > 0) {
						const progress = -(rect.top / isruHeight) + 0.5;
						timeline.progress(progress);
            if ($video.paused) {
              $video.play();
            }
					} else if (!$video.paused) {
						$video.pause();
          }
				});

				state.on('mediachange', (media) => {
					createTimeline();
				});

				state.on('resize', (areaWidth, areaHeight) => {
          isruHeight = $isru.offsetHeight - areaHeight;
          
          createTimeline();
				});

				function createTimeline () {
					timeline && timeline.kill();
					timeline = gsap.timeline({ paused: true });

          timeline.fromTo($earth,       { y: 50, opacity: 0 }, {y: 0, opacity: 1, duration: 1, ease: 'cubic.in' });
          timeline.fromTo($bg,          {opacity: 0}, {opacity: 1, duration: 1, ease:'cubic.in'}, 'firstAnim')
          timeline.fromTo($title,       { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1,  ease: 'power1.easeOut' }, 'firstAnim');
          for (let j = 0; j < $texts.length; j++) {
            const $text = $texts[j];
            timeline.fromTo($text,      { y: 50, opacity: 0 }, { y: 0,opacity: 1, duration: 1, ease: 'power1.easeOut' }, 'firstAnim');
          }
          timeline.fromTo($quoteBox,    { opacity: 0, css: { 'borderColor': '#000' } }, {opacity: 1, css:{'borderColor':'#333'}, duration: 1, ease: 'power1.easeOut' }, 'firstAnim');
          timeline.fromTo($quoteStrong, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power1.easeOut' }, 'firstAnim');
          timeline.fromTo($quote      , { y: 50, opacity: 0 }, { y: 0, opacity: 0.8, duration: 1, ease: 'power1.easeOut' }, 'firstAnim');
          if (state.states.media !== 'mobile') { 
            timeline.fromTo($basecamp, { y: 800, opacity: 0 }, { y: 0, opacity: 1, duration: 3, ease: 'cubic.in' });
          } else {
            timeline.fromTo($basecamp, { y: 400, opacity: 0 }, { y: 0, opacity: 1, duration: 3, ease: 'cubic.in' });
          }
				}
      })();
    })();

    // artemis
    (() => {
      const $artemis = $main.querySelector('.artemis');
      const $artemisSticky = $artemis.querySelector('.sticky');
      const $moonImages = $artemis.querySelectorAll('.moon');
      const $list = $artemis.querySelector('.list');
      const $participation = $artemis.querySelector('.participation');
      const $moonSurface = $artemis.querySelector('.moon-surface');
      const $mars = $artemis.querySelector('.mars');
      const $aurora = $artemis.querySelector('.aurora');
      const $artemisLogo = $artemis.querySelector('.artemis-logo');
      const $moonVideo = $artemis.querySelector('.moon-video');
      const $artemisVideo = $artemis.querySelector('.moon-surface video')
			const $texts = $participation.querySelectorAll('h4, .number, p.ment');
			const numTexts = $texts.length;
			const $path = document.createElement('div');
			const pathControl = {
        y: 0,
        ease: 'linear',
        update: () => {
					$path.style.setProperty('--path-y', pathControl.y + 'px');
				}
      };
			$path.className = 'path';
			$path.innerHTML = '<span class="path-inner"></span>';
			$artemis.children[0].appendChild($path);

      let timeline, artemisHeight, pathHeight, listHeight, startTime;

      

			state.on('scroll', (scrollTop) => {
        const rect = $artemis.getBoundingClientRect();

        if (rect.top < areaHeight && rect.bottom > 0) {
          const progress = (-rect.top / listHeight) + startTime / listHeight;
					timeline.progress(Math.max(0, progress));
          pathControl.tween && pathControl.tween.kill();
          pathControl.tween = gsap.to(pathControl, 0.2, { 
            y: Math.max(-pathHeight, Math.min(0, -pathHeight + (-rect.top + areaHeight / 2) - 574)), 
            ease: 'cubic.out', 
            onUpdate: pathControl.update
          });
          if ($moonVideo.paused) {
            $moonVideo.play();
          }
          if ($artemisVideo.paused) {
            $artemisVideo.play();
          }
        } else if (!$moonVideo.paused) {
          $moonVideo.pause();
        } else if (!$artemisVideo.paused) {
          $artemisVideo.pause();
        }
      });

      state.on('mediachange', (media) => {
				createTimeline();
      });
      
			state.on('resize', (areaWidth, areaHeight) => {
        startTime = (areaHeight / 2);
        listHeight = ($list.offsetHeight - areaHeight + areaHeight / 5) + startTime;
        pathHeight = $path.offsetHeight;
        
        createTimeline();

        if (state.states.media === 'mobile') {
          for (let i = 0; i < $moonImages.length; i++) { 
            $moonImages[i].style = {
              opacity: 1,
            }
          }
          for (let i = 0; i < numTexts; i++) { 
            $texts[i].style = {
              opacity:1,
            }
          }
          $participation.style.opacity = 1;
          $moonSurface.style.opacity = 1;
          $mars.style.opacity = 1;
          $aurora.style.opacity = 1;
          $artemisLogo.style.opacity = 1;
          $path.style.opacity = 1;
          $list.style.opacity = 1;
        }
      });
      
      function createTimeline() {
        timeline && timeline.kill();
        timeline = gsap.timeline({ paused: true });

        if (state.states.media !== 'mobile') {
          timeline.fromTo($path,          { opacity: 0, y: -450 },       { opacity: 1,          y: 0, duration: 2, ease: 'cubic.out'}, 'sameTime')
          timeline.fromTo($moonImages[3], { opacity: 0, x: -20, y: 50 }, { opacity: 0.28, x: 0, y: 0, duration: 1, ease: 'cubic.out'}, 'sameTime');
          timeline.fromTo($moonImages[2], { opacity: 0, x: -20, y: 50 }, { opacity: 0.54, x: 0, y: 0, duration: 1, ease: 'cubic.out'});
          timeline.fromTo($moonImages[1], { opacity: 0, x: -20, y: 50 }, { opacity: 0.64, x: 0, y: 0, duration: 1, ease: 'cubic.out'});
          timeline.fromTo($moonImages[0], { opacity: 0, x: -20, y: 50 }, { opacity: 1,    x: 0, y: 0, duration: 1, ease: 'cubic.out'});

          for (let i = 0; i < numTexts; i++) {
            timeline.fromTo($texts[i], { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'cubic.out' }, i % 2 === 0 ? null : '-=0.5');
          }
          timeline.fromTo($path,          {opacity: 1, y:0},{opacity: 0, y: 250,  duration: 2, ease: 'cubic.out' })
          // timeline.fromTo($participation, {opacity: 1, y:0},{opacity: 0, y:-200, duration:2,  ease: 'cubic.out'}, 'aurora')
          // timeline.fromTo($moonSurface,   {opacity: 1, y:0},{opacity: 0, y:200,  duration:2, ease: 'cubic.out'}, 'aurora')
          // timeline.fromTo($mars,          {opacity: 1, y:0},{opacity: 0, y:200,  duration:2,  ease: 'cubic.out'}, 'aurora')
          // timeline.fromTo($aurora,        {opacity: 1},     {opacity: 0,         duration:2,  ease: 'cubic.out'}, 'aurora')
          // timeline.fromTo($artemisLogo,   {opacity: 1, y:0},{opacity: 0, y:200,  duration:2,  ease: 'cubic.out'}, 'aurora')
          // timeline.fromTo($list,          {opacity: 1 },    {opacity: 0,         duration: 2,  ease: 'cubic.out' },'aurora')
        }
      }
    })();

    // artemis ending
    (() => {
      const $artemisEnding = $main.querySelector('.artemis-ending');
      const $endingImage = $artemisEnding.querySelector('.artemis-ending .galaxy');
      const $endingText = $artemisEnding.querySelector('.artemis-ending p');
      const $galaxyVideo = $artemisEnding.querySelector('.galaxy video');

      const $artemis = $main.querySelector('.artemis');
      const $list = $artemis.querySelector('.list');
      const $participation = $artemis.querySelector('.participation');
      const $moonSurface = $artemis.querySelector('.moon-surface');
      const $moonImage = $artemis.querySelector('.moon-images');
      const $mars = $artemis.querySelector('.mars');
      const $aurora = $artemis.querySelector('.aurora');
      const $artemisLogo = $artemis.querySelector('.artemis-logo');
      let timeline, artemisEndingHeight;

			state.on('scroll', (scrollTop) => {
        const rect = $artemisEnding.getBoundingClientRect();
        if (rect.top < areaHeight && rect.bottom > 0) {
						// const progress = -(rect.top / artemisEndingHeight) + 0.5;
						const progress = -(rect.top / artemisEndingHeight);
						timeline.progress(progress);
            if ($galaxyVideo.paused) {
              $galaxyVideo.play();
            }
					} else if (!$galaxyVideo.paused) {
						$galaxyVideo.pause();
          }
      });

      state.on('mediachange', (media) => {
				createTimeline();
      });
      
			state.on('resize', (areaWidth, areaHeight) => {
				artemisEndingHeight = $artemisEnding.offsetHeight - areaHeight;
        createTimeline();
      });
      
      function createTimeline() {
        timeline && timeline.kill();
        timeline = gsap.timeline({ paused: true });

        timeline.fromTo($participation, {opacity: 1, y:0},{opacity: 0, y: state.states.media == 'mobile' ? 0 : -200, duration: 0.5,  ease: 'cubic.out'}, 'auroraEnding');
        timeline.fromTo($moonSurface,   {opacity: 1, y:0},{opacity: 0, y: state.states.media == 'mobile' ? 200 : artemisEndingHeight*0.3, duration: 0.5,  ease: 'cubic.out'}, 'auroraEnding');
        timeline.fromTo($mars,          {opacity: 1, y:0},{opacity: 0, y: state.states.media == 'mobile' ? 200 : artemisEndingHeight*0.3, duration: 0.5,  ease: 'cubic.out'}, 'auroraEnding');
        timeline.fromTo($aurora,        {opacity: 1},     {opacity: 0,                             duration: 0.5,  ease: 'cubic.out'}, 'auroraEnding');
        timeline.fromTo($artemisLogo,   {opacity: 1, y:0},{opacity: 0, y: state.states.media == 'mobile' ? 200 : artemisEndingHeight*0.3, duration: 0.5,  ease: 'cubic.out'}, 'auroraEnding');
        timeline.fromTo($list,          {opacity: 1 },    {opacity: 0,                             duration: 0.5,  ease: 'cubic.out' },'auroraEnding');

        timeline.fromTo($endingText,  { opacity: 0 }, { opacity: 1, duration: 1, delay: 0.2, ease: 'cubic.out' }, 'auroraEnding')
        timeline.fromTo($endingImage, { opacity: 0, scale:1.5, },{ opacity: 1, scale:1, duration: 1, delay: 0.4, ease: 'cubic.out'},'auroraEnding');
        
        // if (state.states.media !== 'mobile') {
          // $endingText.innerHTML = `<span>${$endingText.dataset.content.split(state.states.media === 'mobile' ? /<br *(?:class="monly")?>/ : /<br *(?:class="wonly")?>/).join('</span><span>')}</span>`;
          // for (let i = 0, max = $endingText.children.length; i < max; i++) {
          //   timeline.fromTo($endingText.children[i], { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 2, delay:2, ease: 'power3.out' });
          // }
        // }
      }
    })();
	})();
});