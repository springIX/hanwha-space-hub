import gsap, { Cubic } from 'gsap';
import Swiper, { Pagination, Navigation, Autoplay } from 'swiper';

import * as state from './state';
import { areaWidth, areaHeight, imagePath } from './common';
import YouTubePlayer from 'youtube-player';


state.on('enter', () => {
  document.querySelector('main.space-kids-introduce') && (() => {
    const $main = document.querySelector('main.space-kids-introduce');

    let isTablet = areaWidth > 1023 ? false : true;
    state.on('resize', (areaWidth, areaHeight) => {
      isTablet = areaWidth > 1023 ? false : true;
    });

    // youtube player
    (() => {
      let $youtube = $main.querySelectorAll('[data-youtubeid]');
      const _on_event = function (event) {
        if (event.data == 1) this && this.classList.add("playing");
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
          _el_wrap.player.playVideo().then(function () { });
        };
      });
    })();

    // introduce
    (() => {
      const $section = $main.querySelector('.introduce');
      const $accordion = $section.querySelector('.accordion');
      const $video = $section.querySelector('.bg video');
      const $children = $section.querySelectorAll('.texts > *:not(video)');
      const $ment = $children[2];
      const $mentHighlights = [].slice.call($ment.querySelectorAll('span'));

      // $ment.dataset.content = $ment.innerHTML;

      let timeline, sectionHeight;

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


      function createTimeline() {
        timeline && timeline.kill();
        timeline = gsap.timeline({ paused: true });

        timeline.fromTo($children[0], { y: 0, opacity: 1 }, { y: -100, opacity: 0, duration: 1, ease: 'cubic.in' });
        timeline.fromTo($children[1], { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: .3, ease: 'power3.out' });
        timeline.to($children[1], { y: -100, opacity: 0, duration: 1, ease: 'cubic.in' });
        timeline.fromTo($children[2], { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: .3, ease: 'power3.out' });

        $mentHighlights.forEach(($highlight, index) => {
          if (index > 0) {
            timeline.to($highlight, { opacity: 1, duration: 1, ease: 'power2.inOut' }, '-=1');
          }
          if (index !== $mentHighlights.length - 1) {
            timeline.to($highlight, { opacity: 0.2, duration: 1, delay: index > 0 ? 0.1 : 0, ease: 'power2.inOut' });
          }
        });

        // $ment.innerHTML = `<span>${ $ment.dataset.content.split(state.states.media === 'mobile' ? /<br *(?=class=".+")[^>]*\/?>/ : /<br *\/?>/).join('</span><span>') }</span>`;
        // for (let i = 0, max = $ment.children.length; i < max; i++) {
        //   timeline.fromTo($ment.children[i], { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 3.5 + i * 0.4);
        // }
      }

    })();



    // program
    (() => {
      const $section = $main.querySelector('.program');
      const $eyebrow = $section.querySelector('.eyebrow');
      const $title = $section.querySelector('.title');
      const $moon = $section.querySelector('.bg .moon');
      const $video = $section.querySelector('.bg video');

      let timeline, sectionHeight;

      state.on('scroll', (scrollTop) => {
        const rect = $section.getBoundingClientRect();
        if (rect.top < areaHeight && rect.bottom > 0) {
          const progress = -(rect.top - areaHeight / 2) / areaHeight;
          timeline && timeline.progress(progress);

          if (!isTablet) $moon.style.transform = `translate3d(0, ${progress * -100}px, 0)`;

          if (progress > 0 && !$section.classList.contains('active')) {
            $section.classList.add('active')
          }

          if ($video.paused) {
            $video.play();
          }
        }
        else {
          if (!$video.paused) {
            $video.pause();
          }
          if ($section.classList.contains('active')) {
            $section.classList.remove('active');
          }
        }
      });

      state.on('mediachange', (media) => {
        createTimeline();
      });

      state.on('resize', (areaWidth, areaHeight) => {
        sectionHeight = $section.offsetHeight - areaHeight;
      });

      function createTimeline() {
        timeline && timeline.kill();
        timeline = gsap.timeline({ paused: true });

        timeline.fromTo($eyebrow, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', }, 'seq-1');
        timeline.fromTo($title, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: .2, ease: 'power3.out' }, 'seq-1');
      }

    })();

    // explore
    (() => {
        const $section = $main.querySelector(".explore");
        const $eyebrow = $section.querySelector('.eyebrow');
        const $title = $section.querySelector('.title');
        const $btn = $section.querySelector('.btn-hud');
        const $video = $section.querySelector('.video-wrapper video');
        const $arraySolarSystemImg = $section.querySelectorAll('.planet-wrapper img');




        let timeline, sectionHeight;

        state.on('scroll', (scrollTop) => {
            const rect = $section.getBoundingClientRect();
            if (rect.top < areaHeight && rect.bottom > 0) {
                const progress = -rect.top / sectionHeight;
                timeline && timeline.progress(progress);
                console.log(progress)
            }
        });

        state.on('mediachange', (media) => {
            createTimeline();
        });

        state.on('resize', (areaWidth, areaHeight) => {
            sectionHeight = $section.offsetHeight - areaHeight;
        }); 

        function createTimeline() {
            timeline && timeline.kill();
            timeline = gsap.timeline({ paused: true });

            timeline.fromTo($eyebrow, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 0);
            timeline.fromTo($title, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 0.5);
            timeline.fromTo($btn, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 1);
            timeline.to($video, { scale: 1, y:0, duration: 2, ease: 'power3.out'}, 1.5);
            const planetMotionDelay = 2.5;

            $arraySolarSystemImg.forEach(($element, index) => {
                timeline.to($element, { opacity: 1, duration: 1, ease: 'power3.out' }, (index*0.2) + planetMotionDelay);

                let planetMoveDelay = (index*0.2) + planetMotionDelay + 0.1;

                if($element.classList.contains("mercury")) {
                  timeline.fromTo($element, { y:0, x: 0}, {y:-4, x: 10, duration: 1, ease: "power.out"}, planetMoveDelay)
                }
                if($element.classList.contains("venus")) {
                  timeline.fromTo($element, { y:0, x: 0}, {y:-10, x: 7, duration: 1, ease: "power.out"}, planetMoveDelay)
                }
                if($element.classList.contains("earth")) {
                  timeline.fromTo($element, { y:0, x: 0}, {y:-7, x: 10, duration: 1, ease: "power.out"}, planetMoveDelay)
                }
                if($element.classList.contains("mars")) {
                  timeline.fromTo($element, { y:0, x: 0}, {y:-2, x: 10, duration: 1, ease: "power.out"}, planetMoveDelay)
                }
                if($element.classList.contains("jupiter")) {
                  timeline.fromTo($element, { y:0, x: 0}, {y:3, x: -5, duration: 1, ease: "power.out"}, planetMoveDelay)
                }
                if($element.classList.contains("saturn")) {
                  timeline.fromTo($element, { y:0, x: 0}, {y:-5, x: 10, duration: 1, ease: "power.out"}, planetMoveDelay)
                }
                if($element.classList.contains("neptune")) {
                  timeline.fromTo($element, { y:0, x: 0}, {y:1, x: -5, duration: 1, ease: "power.out"}, planetMoveDelay)
                }
                if($element.classList.contains("pluto")) {
                  timeline.fromTo($element, { y:0, x: 0}, {y:1, x: -5, duration: 1, ease: "power.out"}, planetMoveDelay)
                }
                if($element.classList.contains("uranus")) {
                  timeline.fromTo($element, { y:0, x: 0}, {y:5, x: 10, duration: 1, ease: "power.out"}, planetMoveDelay)
                }
            });
        }

    })();

    

    // apply
    (() => {
      const $section = $main.querySelector('.apply');
      const $eyebrow = $section.querySelector('.eyebrow');
      const $title = $section.querySelector('.title');
      const $btn = $section.querySelector('.btn-hud');
      const $earth = $section.querySelector('.bg .earth');
      const $video = $earth.querySelector('video');
      const $kids = $section.querySelector('.bg .kids');
      const $research = $section.querySelector('.research-results');
      const $pdfFrame = $section.querySelector('.pdf-frame');
      const $popupWrap = $section.querySelector('.popup-wrap');
      const $researchPopupBtn = $section.querySelectorAll('.research-results .swiper-slide button');
      const $header = document.querySelector('#header');
      const $sideSticky = document.querySelector('.side-sticky-wrap');
      // const $pdfDown = $section.querySelector('.pdf-down-btn');


      let timeline, sectionHeight;

      state.on('scroll', (scrollTop) => {
        const rect = $section.getBoundingClientRect();
        if (rect.top < areaHeight && rect.bottom > 0) {
          const progress = -(rect.top - areaHeight / 2) / areaHeight;
          timeline && timeline.progress(progress);
          if ($video.paused) {
            $video.play();
          }

          $earth.style.transform = `translate3d(-50%, ${Math.max(600, areaWidth) * 0.08 * progress}px, 0)`;
          $kids.style.transform = `translate3d(-50%, ${Math.max(600, areaWidth) * -0.15 * progress}px, 0)`;
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

      function createTimeline() {
        timeline && timeline.kill();
        timeline = gsap.timeline({ paused: true });

        timeline.fromTo($eyebrow, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 'seq-1');
        timeline.fromTo($title, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: .2, ease: 'power3.out' }, 'seq-1');
        timeline.fromTo($btn, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: .4, ease: 'power3.out' }, 'seq-1');
      }

      // 250317 우주의 조약돌 슬라이드
      state.on('scroll', (scrollTop) => {
        const rect = $research.getBoundingClientRect();
        if (rect.top < areaHeight && rect.bottom > 0) {
          const researchResults = -(rect.top - areaHeight / 2) / areaHeight;

          if (researchResults > 0 && !$research.classList.contains('active')) {
            $research.classList.add('active')
          }
        }
        else {
          if ($research.classList.contains('active')) {
            $research.classList.remove('active');
          }
        }
      });

      const slider = new Swiper('.swiper.research-results', {
        modules: [Pagination, Navigation],
        slidesPerView: 1.15,
        spaceBetween: 20,
        speed: 1000,
        centeredSlides: true,
        loop: true,
        loopedSlides: 2,
        navigation: {
          prevEl: ".swiper.research-results .slide-nav.prv",
          nextEl: ".swiper.research-results .slide-nav.nxt",
        },
        pagination: {
          el: ".apply .slide-pagi",
          clickable: true
        },
        on: {
          slideChangeTransitionStart: function () {
            let frame = document.querySelector('.apply .research-results .frame');
            frame.classList.add('active');
            setTimeout(() => {
              frame.classList.remove('active');
            }, 500);
          }
        },
        breakpoints: {
          768: {
            slidesPerView: 'auto',
            spaceBetween: 160,
          },
        },
      });

      $researchPopupBtn.forEach(button => {
        button.addEventListener('click', function () {
          const pdfSrc = this.getAttribute('data-pdf');
          if (window.innerWidth <= 767) {
            window.open(pdfSrc, '_blank');
          } else {
            $pdfFrame.src = pdfSrc + '#toolbar=0&navpanes=0&scrollbar=0';
            // $pdfDown.href = pdfSrc;
            $popupWrap.classList.add('on');
            $header.style.touchAction = "none";
            $header.style.pointerEvents = "none";
            $header.style.opacity = 0.3;
            $sideSticky.style.zIndex = "-1";
          }
        });
      });

      document.querySelector('.close-popup').addEventListener('click', function () {
        $pdfFrame.src = '';
        // $pdfDown.href = '';
        $popupWrap.classList.remove('on');
        $header.style.touchAction = "auto";
        $header.style.pointerEvents = "auto";
        $header.style.opacity = 1;
        $sideSticky.style.zIndex = "1";
      });

    })();



    // mediaroom
    (() => {
      const $section = $main.querySelector('.mediaroom');
      const $title = $section.querySelector('.title');
      const $btn = $section.querySelector('.btns .btn-hud');
      const $sns = $section.querySelector('.btns .sns');
      const $slider = $section.querySelector('.slider');

      let timeline, sectionHeight;

      let mediaroomSlider;

      state.on('scroll', (scrollTop) => {
        const rect = $section.getBoundingClientRect();
        if (rect.top < areaHeight && rect.bottom > 0) {
          const progress = -(rect.top - areaHeight / 2) / areaHeight;
          timeline && timeline.progress(progress * 1.2);
        }
      });

      state.on('mediachange', (media) => {
        createTimeline();
        if (media === 'desktop') {
          mediaroomSlider && mediaroomSlider.destroy();
          mediaroomSlider = new Swiper('.mediaroom .swiper', {
            modules: [Pagination, Navigation, Autoplay],
            // autoplay: {
            //     delay: 5500,
            //     disableOnInteraction: false,
            // },
            pagination: {
              el: ".mediaroom .swiper-pagination",
              type: "fraction",
              formatFractionCurrent: function (number) {
                return String(number).padStart(2, '0');
              },
              formatFractionTotal: function (number) {
                return String(number).padStart(2, '0');
              }
            },
            navigation: {
              prevEl: ".mediaroom .swiper-button-prev",
              nextEl: ".mediaroom .swiper-button-next",
            },
          });
        } else {
          mediaroomSlider && mediaroomSlider.destroy();
          mediaroomSlider = new Swiper('.mediaroom .swiper', {
            modules: [Pagination, Navigation, Autoplay],
            pagination: {
              el: ".mediaroom .swiper-pagination",
              clickable: true,
            },
          });
        }

      });

      state.on('resize', (areaWidth, areaHeight) => {
        sectionHeight = $section.offsetHeight - areaHeight;
      });

      function createTimeline() {
        timeline && timeline.kill();
        timeline = gsap.timeline({ paused: true });

        timeline.fromTo($slider, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power3.out' }, 'seq-1');
        timeline.fromTo($title, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 'seq-1');
        timeline.fromTo($btn, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: .2, ease: 'power3.out' }, 'seq-1');
        timeline.fromTo($sns, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: .3, ease: 'power3.out' }, 'seq-1');
      }

    })();



    // support
    (() => {
      const $section = $main.querySelector('.support');
      const $visual = $section.querySelector('.visual');
      const $title = $section.querySelector('.title');
      const $partners = $section.querySelector('.partners');
      const $partnersChild = [...$partners.children];

      let sectionHeight, timeline;

      state.on('scroll', (scrollTop) => {
        const rect = $section.getBoundingClientRect();
        if (rect.top < areaHeight && rect.bottom > 0) {
          const progress = -rect.top / sectionHeight;
          timeline && timeline.progress(Math.max(0, progress));

          $visual.style.opacity = Math.min(.9, (0.7 - rect.top / areaHeight) * 1);
        }
      });

      state.on('resize', (areaWidth, areaHeight) => {
        sectionHeight = $section.offsetHeight - areaHeight;

        createTimeline();
      });

      function createTimeline() {
        timeline && timeline.kill();
        timeline = gsap.timeline({ paused: true, delay: 1 });

        timeline.fromTo($title, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'quart.out' },);
        timeline.to($title, { opacity: 0, duration: 1, ease: 'quart.out' },);
        timeline.fromTo($partnersChild[0], { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.5, ease: 'quart.out' }, 'seq-3');
        timeline.fromTo($partnersChild[1], { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.5, delay: .2, ease: 'quart.out' }, 'seq-3');
        timeline.fromTo($partnersChild[2], { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.5, delay: .4, ease: 'quart.out' }, 'seq-3');
      }
    })();

  })();
});


















