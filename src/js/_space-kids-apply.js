import gsap, { Cubic } from 'gsap';
import Swiper, { Pagination } from 'swiper';

import * as state from './state';
import { areaWidth, areaHeight, imagePath } from './common';


state.on('enter', () => {
	document.querySelector('main.space-kids-apply') && (() => {
		const $main = document.querySelector('main.space-kids-apply');

    let isTablet = areaWidth > 1023 ? false : true;
    state.on('resize', (areaWidth, areaHeight) => {
      isTablet = areaWidth > 1023 ? false : true;
    });

		// vision
		(() => {
			const $section = $main.querySelector('.vision');
      const $video = $section.querySelector('.bg video');
      const $children = $section.querySelectorAll('.texts > *:not(video)');
      const $ment = $children[1];
      
      let timeline, sectionHeight;

      $ment.dataset.content = $ment.innerHTML;

      state.on('scroll', (scrollTop) => {
        const rect = $section.getBoundingClientRect();
        if (rect.top < areaHeight && rect.bottom > 0) {
          const progress = -rect.top / sectionHeight;
          timeline && timeline.progress(progress);
          if ($video.paused) {
            $video.play();
          }
        } 
        else if (!$video.paused) {
          $video.pause();
        }
      });

      state.on('mediachange', (media) => {
        createTimeline();
      });

      state.on('resize', (areaWidth, areaHeight) => {
        sectionHeight = $section.offsetHeight - areaHeight;
      });


      function createTimeline () {
        timeline && timeline.kill();
        timeline = gsap.timeline({ paused: true });

        timeline.fromTo($children[0], { y: 0, opacity: 1 }, { y: -100, opacity: 0, duration: 1, ease: 'cubic.in' });
        // timeline.fromTo($children[1], { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: .3, ease: 'power3.out' });

        $ment.innerHTML = `<span>${ $ment.dataset.content.split(state.states.media === 'mobile' ? /<br *(?=class=".+")[^>]*\/?>/ : /<br *\/?>/).join('</span><span>') }</span>`;
        for (let i = 0, max = $ment.children.length; i < max; i++) {
          timeline.fromTo($ment.children[i], { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 1 + i * 0.4);
        }
      }

		})();


		// procedure
		(() => {
			const $section = $main.querySelector('.procedure');

      let headingTiemline;

      // headeings
      (() => {
        const $headings = $section.querySelector('.headings');
        const $inwrap = $headings.querySelector('.inwrap');
        const $titles = $headings.querySelector('.titles');

        state.on('mediachange', (media) => {
          if ( media === 'desktop' ) createTimeline()
          else headingTiemline = null;
        });

        function createTimeline () {
          headingTiemline && headingTiemline.kill();
          headingTiemline = gsap.timeline({ paused: true });
          headingTiemline.fromTo($titles.children[0], { opacity: 1, y: 0 }, { opacity: 0, y: -50, duration: 1, ease: 'cubic.out' }, 'seq1');
          headingTiemline.fromTo($titles.children[1], { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'cubic.out' }, 'seq1');
        }
      })();

      // people
      (() => {
        const $article = $section.querySelector('.people');
        const $contentItems = $article.querySelectorAll('.content');
        
        let timeline, articleHeight;

        observing($contentItems[0]);
        observing($contentItems[1]);
        observing($contentItems[2]);
      })();

      // together
      (() => {
        const $article = $section.querySelector('.together');
        const $path = $article.querySelector('.path');
        const $step = $article.querySelector('.step');
        const $stepLis = $article.querySelectorAll('.step > li');
        
        let timeline, articleHeight, pathHeight, stepHeight;
        let stepRect = $step.getBoundingClientRect();
        let pathRect;

        const pathControl = {
          y: -5000,
          update: () => {
            $path.style.setProperty('--path-y', pathControl.y + 'px');
          }
        };

        state.on('scroll', (scrollTop) => {
          const rect = $article.getBoundingClientRect();
          stepRect = $step.getBoundingClientRect();
          pathRect = isTablet ? stepRect : rect;
          if (rect.top < areaHeight && rect.bottom > 0) {
            if ( headingTiemline ) {
              // #############################################################################
              const headingProgress = -(rect.top - 200) / 400;
              headingTiemline.progress(headingProgress);
            }
            
            const progress = -(stepRect.top - areaHeight/2) / stepRect.height;
            timeline && timeline.progress(progress);
            
            let pathY = Math.max(-pathHeight, Math.min(0, -pathHeight + (-pathRect.top + areaHeight / 2)));
            pathControl.tween && pathControl.tween.kill();
            pathControl.tween = gsap.to(pathControl, 0.2, { y: pathY, ease: 'cubic.out', onUpdate: pathControl.update });
          } 
        });

        state.on('mediachange', (media) => {
          createTimeline();
        });

        state.on('resize', (areaWidth, areaHeight) => {
          articleHeight = $article.offsetHeight - areaHeight;
          pathHeight = $path.offsetHeight;
          stepRect = $step.getBoundingClientRect();
        });

        function createTimeline () {
          timeline && timeline.kill();
          timeline = gsap.timeline({ paused: true });
          for (let i = 0; i < $stepLis.length; i++) {
            timeline.fromTo($stepLis[i], { opacity: 0, }, { opacity: 1, duration: 1, ease: 'cubic.out' }, i % 2 === 0 ? null : '-=0.5');
          }
        }
      })();


		})();



		// faq
		(() => {
			const $section = $main.querySelector('.faq');

			const $faqTap = $section.querySelector('.faq-tab');
			const $faqList = $section.querySelector('.faq-list');
			const $faqContent = $section.querySelector('.faq-content');
      const $faqTapBtns = $faqTap.querySelectorAll('button');
      const $faqListLis = $faqList.querySelectorAll('.accordion > li');
      const $faqListBtn = $faqList.querySelector('.btn-more');
      const $faqTotal = $faqList.querySelector('.total');

      let timeline, sectionHeight, faqLiHeight, faqHeight;
      let currentCategory;
      let isClosed = true;

// const config = { attributes: true, childList: true, subtree: true };
// const callback = (mutationList, observer) => {
//   for (const mutation of mutationList) {
//     if (mutation.type === "childList") {
//     } else if (mutation.type === "attributes") {
//       if ( mutation.attributeName == 'class') {
//       }  
//     }
//   }
// };
// const observer = new MutationObserver(callback);

      // 최대 10개 노출
      if ( $faqListLis.length <= 10 ) {
        $faqListBtn.classList.add('hide');
      }
      $faqListLis.forEach(($li, index) => {
        $li.style.setProperty('--li-height', $li.offsetHeight + 'px');
        // observer.observe($li, config);
        
        if ( index > 9 ) {
          $li.classList.add('hide');
          $li.classList.remove('active');
        }

        
      });

      // faq 더보기 클릭 이벤트
      $faqListBtn.addEventListener('click', () => {
        const $lis = currentCategory ? $faqList.querySelectorAll(`.accordion > li[data-category="${currentCategory}"]`) : $faqList.querySelectorAll(`.accordion > li`);
        if ( isClosed ) {
          $faqListBtn.classList.add('open');
          isClosed = false;
          
          $lis.forEach(($li, index) => {
            $li.classList.remove('hide');
          });
        } else {
          $faqListBtn.classList.remove('open');
          isClosed = true;

          $lis.forEach(($li, index) => {
            if ( index > 9 ) {
              $li.classList.add('hide');
              $li.classList.remove('active');
            }
          });
        }
      });

      // faq tab 클릭 이벤트
      $faqTapBtns[0].parentNode.classList.add('active');
      $faqTapBtns.forEach($btn => {
        $btn.addEventListener('click', () => {
          const category = $btn.dataset.category;
          currentCategory = category;

          $faqTap.querySelector('li.active').classList.remove('active');
          $btn.parentNode.classList.add('active');

          const $lis = currentCategory ? $faqList.querySelectorAll(`.accordion > li[data-category="${currentCategory}"]`) : $faqList.querySelectorAll(`.accordion > li`);
          if ( $lis.length <= 10 ) {
            $faqListBtn.classList.add('hide');
          } else {
            $faqListBtn.classList.remove('hide');
          }

          $faqListLis.forEach(($li, index) => {
            if ( currentCategory == '' ) {
              if ( isClosed ) {
                index < 10 ? $li.classList.remove('hide') : $li.classList.add('hide') && $li.classList.remove('active');
              } else {
                $li.classList.remove('hide');
              }
            } else if ( $li.dataset.category === category ) {
              
              if ( isClosed ) {
                $li.classList.remove('hide');
              } else {
                $li.classList.remove('hide');
              }
            } else {
              $li.classList.add('hide');
              $li.classList.remove('active');
            }
          });

          // total
          $faqTotal.innerHTML = `총 ${$lis.length}개`;
        });
      });


      state.on('scroll', (scrollTop) => {
        const rect = $section.getBoundingClientRect();
        if (rect.top < areaHeight && rect.bottom > 0) {
          const progress = -rect.top / sectionHeight;
          timeline && timeline.progress(progress);
        } 
      });

      state.on('mediachange', (media) => {
        createTimeline();
      });

      state.on('resize', (areaWidth, areaHeight) => {
        sectionHeight = $section.offsetHeight - areaHeight;
        faqLiHeight = $faqListLis[0].querySelector('button').offsetHeight;
      });

      function createTimeline () {
        timeline && timeline.kill();
        timeline = gsap.timeline({ paused: true });
      }
		})();

	})();
});



// io active
function observing ( $target ) {
  const io = function (entries, observer) {
    entries.forEach(entry => {
      if (entry.intersectionRatio <= 0) return
      if (entry.isIntersecting) {
        $target.classList.add('on');
      } else {
        $target.classList.remove('on');
      }
    });
  }
  const options = { root: null, rootMargin: '0px', threshold: 0 }
  const observer = new IntersectionObserver(io, options);
  observer.observe($target);
}
























