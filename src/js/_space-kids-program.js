import gsap, { Cubic } from 'gsap';

import * as state from './state';
import { areaWidth, areaHeight, imagePath } from './common';


state.on('enter', () => {
	document.querySelector('main.space-kids-program') && (() => {
		const $main = document.querySelector('main.space-kids-program');

    // vision
    (() => {
      const $vision = $main.querySelector('.vision');

      // intro
      (() => {
        const $intro = $vision.querySelector('.intro');
        const $video = $vision.querySelector('video');
        const $children = $intro.querySelectorAll('.texts > *:not(video)');

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
  
          timeline.fromTo($children[0], { y: 0, opacity: 1 }, { y: -100, opacity: 0, duration: 1, ease: 'cubic.in' });
          timeline.fromTo($children[1].children[0], { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'cubic.in' });
          timeline.fromTo($children[1].children[1], { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'cubic.in' });
        }
      })();
    })();


    // curriculum
		(() => {
			const $curriculum = $main.querySelector('.curriculum');
      const $eyebrow = $curriculum.querySelector('.eyebrow');
      const $title = $curriculum.querySelector('.title');
      const $box = $curriculum.querySelector('.list-box');
      const $bg = document.querySelector('.vision .bg');

      let timeline, sectionHeight;

      state.on('scroll', (scrollTop) => {
        const rect = $curriculum.getBoundingClientRect();
        if (rect.top < areaHeight && rect.bottom > 0) {
          const progress = -(rect.top - areaHeight/2) / areaHeight;
          timeline && timeline.progress(progress);
        } 
      });

      state.on('mediachange', (media) => {
        createTimeline();
      });

      state.on('resize', (areaWidth, areaHeight) => {
        sectionHeight = $curriculum.offsetHeight - areaHeight;
      });

      function createTimeline () {
        timeline && timeline.kill();
        timeline = gsap.timeline({ paused: true });

        timeline.fromTo($bg, { opacity : 1 }, { opacity: 0.2, duration: 1, ease: 'power3.out' }, 'seq-1');

        timeline.fromTo($eyebrow, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 'seq-1');
        timeline.fromTo($title, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: .2, ease: 'power3.out' }, 'seq-1');
        timeline.fromTo($box, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: .4, ease: 'power3.out' }, 'seq-1');
      }

		})();



    // humanities
		(() => {
			const $humanities = $main.querySelector('.humanities');
      const $title = $humanities.querySelector('.tit-wrap');
      const $desc = $humanities.querySelector('.station-desc');
      const $list = $humanities.querySelector('.people-list')
      

      let timeline, sectionHeight;

      state.on('scroll', (scrollTop) => {
        const rect = $humanities.getBoundingClientRect();
        if (rect.top < areaHeight && rect.bottom > 0) {
          const progress = -(rect.top - areaHeight / 1.6) / areaHeight;
          timeline && timeline.progress(progress);
        } 
      });

      state.on('mediachange', (media) => {
        createTimeline();
      });

      state.on('resize', (areaWidth, areaHeight) => {
        sectionHeight = $humanities.offsetHeight - areaHeight;
      });

      function createTimeline () {
        timeline && timeline.kill();
        timeline = gsap.timeline({ paused: true });

        timeline.fromTo($title, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 'seq-1');
        timeline.fromTo($desc, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: .2, ease: 'power3.out' }, 'seq-1');
        timeline.fromTo($list, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: .4, ease: 'power3.out' }, 'seq-1');
        // }
      }

		})();

    // mission
		(() => {
			const $mission = $main.querySelector('.mission');
      const $title = $mission.querySelector('.tit-wrap');
      // const $topTxtAll = $mission.querySelectorAll('.t_con > .item')
      const $topTxt = $mission.querySelector('.t_con');
      const $listAll = document.querySelectorAll('.professor-wrap > .item');

      let timeline, sectionHeight;

      state.on('scroll', (scrollTop) => {
        const rect = $mission.getBoundingClientRect();
        if (rect.top < areaHeight && rect.bottom > 0) {
          const progress = -(rect.top - areaHeight / 1.6) / areaHeight;
          timeline && timeline.progress(progress);
        } 

        $listAll.forEach((elem) => {
          let listRec = elem.getBoundingClientRect();
          if (listRec.top + areaHeight / 2.5 < areaHeight && listRec.bottom > - areaHeight) {
            elem.classList.add('show')
          } else{
            elem.classList.remove('show')
          }

        });
      });

      state.on('mediachange', (media) => {
        createTimeline();
      });

      state.on('resize', (areaWidth, areaHeight) => {
        sectionHeight = $mission.offsetHeight - areaHeight;
      });

      function createTimeline () {
        timeline && timeline.kill();
        timeline = gsap.timeline({ paused: true });

        timeline.fromTo($title, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 'seq-1');
        timeline.fromTo($topTxt, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: .2, ease: 'power3.out' }, 'seq-1');
      }



		})();



    // result
		(() => {
			const $result = $main.querySelector('.result');
      const $title = $result.querySelector('.tit-wrap');
      const $desc = $result.querySelector('.station-desc');
      const $listAll = $result.querySelectorAll('.list > li')
      

      let timeline, sectionHeight;

      state.on('scroll', (scrollTop) => {
        const rect = $result.getBoundingClientRect();
        if (rect.top < areaHeight && rect.bottom > 0) {
          const progress = -(rect.top - areaHeight / 1.6) / areaHeight;
          timeline && timeline.progress(progress);

        } 
      });

      state.on('mediachange', (media) => {
        createTimeline();
      });

      state.on('resize', (areaWidth, areaHeight) => {
        sectionHeight = $result.offsetHeight - areaHeight;
      });

      function createTimeline () {
        timeline && timeline.kill();
        timeline = gsap.timeline({ paused: true });

        timeline.fromTo($title, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 'seq-1');
        timeline.fromTo($desc, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: .2, ease: 'power3.out' }, 'seq-1');

        for (let i = 0; i < $listAll.length; i++) {
          const $list = $listAll[i]
          timeline.fromTo($list, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1,  delay: .4 + i * 0.2, ease: 'power3.out' }, 'seq-1');
        }
      }

		})();


    // honor
		(() => {
			const $honor = $main.querySelector('.honor');
      const $title = $honor.querySelector('.tit-wrap');
      const $desc = $honor.querySelector('.station-desc');
      const $listAll = $honor.querySelectorAll('.benefit-list > li')
      

      let timeline, sectionHeight;

      state.on('scroll', (scrollTop) => {
        const rect = $honor.getBoundingClientRect();
        if (rect.top < areaHeight && rect.bottom > 0) {
          const progress = -(rect.top - areaHeight / 1.6) / areaHeight;
          timeline && timeline.progress(progress);
        } 
      });

      state.on('mediachange', (media) => {
        createTimeline();
      });

      state.on('resize', (areaWidth, areaHeight) => {
        sectionHeight = $honor.offsetHeight - areaHeight;
      });

      function createTimeline () {
        timeline && timeline.kill();
        timeline = gsap.timeline({ paused: true });

        timeline.fromTo($title, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 'seq-1');
        timeline.fromTo($desc, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: .2, ease: 'power3.out' }, 'seq-1');

        for (let i = 0; i < $listAll.length; i++) {
          const $list = $listAll[i]
          timeline.fromTo($list, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1,  delay: .4 + i * 0.2, ease: 'power3.out' }, 'seq-1');
        }
      }

		})();



	})();
});
























