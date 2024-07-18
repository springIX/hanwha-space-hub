import gsap, { Cubic } from 'gsap';

import * as state from './state';
import { language, areaWidth, areaHeight, imagePath, historyManager } from './common';
import { createVideoNode, getCountDown, splitLetters, splitLineToBlock, removeNode, reflowTrick } from './util';


state.on('enter', () => {
	document.querySelector('main.main-spacekids') && (() => {
		const $html = document.documentElement;
    const $main = document.querySelector('main.main-spacekids');
    const $signupLink = $main.querySelector('.signup-link');

    let isTablet = areaWidth > 1023 ? false : true;
    state.on('resize', (areaWidth, areaHeight) => {
      isTablet = areaWidth > 1023 ? false : true;
    });

    // visual
    (() => {
      const $section = $main.querySelector('.visual');
      const $sticky = $section.querySelector('.sticky');
      const $inwrap = $section.querySelector('.inwrap');
      const $texts = $section.querySelector('.texts');
      const $bg = $section.querySelector('.bg');
      const $bgVideo = $section.querySelector('.bg video');
      const $ment = $section.querySelector('.texts .ment');
      const $bannerLink = $section.querySelector('.banner-link');

      let timeline, sectionHeight;

      // action
      state.on('scroll', (scrollTop) => {
        const rect = $section.getBoundingClientRect();
        if (rect.top < areaHeight && rect.bottom > 0) {
          const progress = -rect.top / sectionHeight;
          timeline && timeline.progress(progress);
          // if ( progress > 1 || progress == 0 ) timeline.progress(1);

          // const parallaxProgress = Math.min(1, Cubic.easeIn(Math.max(0, -rect.top / areaHeight)));
					// $bg.style.transform = `translate3d(0, ${parallaxProgress*-200}px, 0)`;
					// $texts.style.transform = `translate3d(0, ${parallaxProgress*-100}px, 0)`;

          if ( !$section.classList.contains('active') ) {
            $section.classList.add('active');
            $section.querySelectorAll('.elt-t').forEach($el => {
              $el.classList.add('show');
            });
            $bgVideo.play();
          }
        } else {
          // timeline && timeline.progress(1);

          if ( $section.classList.contains('active') ) {
            $section.classList.remove('active');
            $bgVideo.pause();
          }

        }
      });
      state.on('resize', (areaWidth, areaHeight) => {
        sectionHeight = $section.offsetHeight - areaHeight;
        // motionLineText($ment);
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
        timeline.fromTo($texts, { y: 0 }, { y: -areaHeight*0.1, duration: 1, ease: 'none', }, 'seq-1');
        timeline.fromTo($inwrap, { opacity: 1 }, { opacity: 0, duration: 1, ease: 'none', }, 'seq-1');
        timeline.fromTo($bannerLink, { opacity: 1 }, { opacity: 0, duration: 1, ease: 'none', }, 'seq-1');
      }
    })();

    
    // exploration
    (() => {
      const $section = $main.querySelector('.exploration');

      state.on('resize', (areaWidth, areaHeight) => {
        $section.style.setProperty('--exploration-bg-height', $section.offsetHeight - ($section.querySelector('.intro').offsetHeight - areaHeight) + 'px');
      });

      // intro
      (() => {
        const $article = $section.querySelector('.intro');
        const $ment = $article.querySelector('.ment');
        const $texts = $article.querySelector('.texts');
        const $orbit = $article.querySelector('.orbit');
        const $eltSTexts = $article.querySelectorAll('.elt-s span span');

        let timeline, articleHeight;

        // action
        state.on('scroll', (scrollTop) => {
          const rect = $article.getBoundingClientRect();
          if (rect.top < areaHeight && rect.bottom > 0) {
            const progress = -(rect.top - areaHeight/2) / (articleHeight + areaHeight/2);
            timeline && timeline.progress((progress));
            // if ( progress > 1 || progress == 0 ) timeline.progress(1);

            if ( !isTablet ) $texts.style.transform = `translate3d(0, ${progress*-150}px, 0)`;

            if ( progress < 0 ) $orbit.classList.remove('active');
          } else {
            // timeline && timeline.progress(1);
          }
        });
        state.on('resize', (areaWidth, areaHeight) => {
          articleHeight = $article.offsetHeight;
          // motionLineText($ment, '', '', false);
          // motionLineText($text);
        });

        state.on('mediachange', (media) => {
          createTimeline();
        });

        // event
        const createTimeline = function () {
          timeline && timeline.kill();
          resetNodes($article);
          timeline = gsap.timeline({ paused: true });

          const styles = { orbitRotate: 0 };
          
          timeline.fromTo($eltSTexts[0], { opacity: 0, y: '120%' }, { opacity: 1, y: 0, duration: 1, ease: 'quart.out', 
            onStart: () => { $orbit.classList.add('active'); }, 
            onUpdate: () => { $signupLink && $signupLink.classList.contains('active') && $signupLink.classList.remove('active'); }, 
            onComplete: () => { $signupLink && $signupLink.classList.add('active'); }
          }, 'seq-1');
          timeline.fromTo($eltSTexts[1], { opacity: 0, y: '120%' }, { opacity: 1, y: 0, duration: 1, ease: 'quart.out' }, 'seq-1');
          if ( !isTablet )  timeline.fromTo($orbit, { x: 100, y: 100, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 1, ease: 'quart.out' }, 'seq-1');
          else              timeline.fromTo($orbit, { scale: 1.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: 'quart.out' }, 'seq-1');

          timeline.to($eltSTexts[0], { opacity: 0, y: "-100%", duration: 1, ease: 'quart.out' }, 'seq-2');
          timeline.to($eltSTexts[1], { opacity: 0, y: "-100%", duration: 1, ease: 'quart.out' }, 'seq-2');
          timeline.to($eltSTexts[2], { opacity: 1, y: 0, duration: 1, ease: 'quart.out' }, 'seq-2');
          if ( !isTablet )  timeline.to(styles, { orbitRotate: -2, duration: 1, ease: 'power2.inout', onUpdate: updateOrbitRotate }, 'seq-2');
          else              timeline.to(styles, { orbitRotate: -10, duration: 1, ease: 'linear', onUpdate: updateOrbitRotate }, 'seq-2');

          timeline.to($eltSTexts[2], { opacity: 0, duration: 1, ease: 'quart.out' }, 'seq-3');
          timeline.to($orbit, { opacity: 0, duration: 1, ease: 'quart.out' }, 'seq-3');
          if ( !isTablet )  timeline.to(styles, { orbitRotate: -4, duration: 1, ease: 'power2.inout', onUpdate: updateOrbitRotate }, 'seq-3');
          else              timeline.to(styles, { orbitRotate: -30, duration: 1, ease: 'linear', onUpdate: updateOrbitRotate }, 'seq-3');

          function updateOrbitRotate () {
            $orbit.style.setProperty('--orbit-rotate', -styles.orbitRotate + 'deg')
            if ( !isTablet ) $orbit.style.transform = `translate3d(0, 0, 0) scale(1) rotate(${styles.orbitRotate}deg)`
            else $orbit.style.transform = `translate3d(-50%, -50%, 0) scale(1) rotate(${styles.orbitRotate}deg)`
          }
        }
      })();



      // destination
      (() => {
        const $article = $section.querySelector('.destination');
        const $keywords = $article.querySelector('.keywords');
        const $keywordTexts = $keywords.querySelectorAll('span');
        const $title = $article.querySelector('.title');

        let timeline, articleHeight;

        // action
        state.on('scroll', (scrollTop) => {
          const rect = $article.getBoundingClientRect();
          if (rect.top < areaHeight && rect.bottom > 0) {
            const progress = -(rect.top - areaHeight/2) / (areaHeight/2);
            timeline && timeline.progress((progress));
            // if ( progress > 1 || progress == 0 ) timeline.progress(1);

            if ( !isTablet ) $title.style.transform = `translate3d(0, ${progress*-80 + 80}px, 0)`;

          } else {
            // timeline && timeline.progress(1);
          }
        });
        state.on('resize', (areaWidth, areaHeight) => {
          articleHeight = $article.offsetHeight;
        });

        state.on('mediachange', (media) => {
          createTimeline();
        });

        // event
        const createTimeline = function () {
          timeline && timeline.kill();
          resetNodes($section);
          timeline = gsap.timeline({ paused: true });
          
          // timeline.fromTo($keywordTexts[0], { y: '100%' }, { y: 0, duration: 1, ease: 'power1.out' }, 'seq-1');

          timeline.fromTo($keywordTexts[0], { y: 0 }, { y: '-100%', duration: 1, delay: 1, ease: 'none' }, 'seq-2');
          timeline.fromTo($keywordTexts[1], { y: '100%' }, { y: 0, duration: 1, delay: 1, ease: 'none' }, 'seq-2');
          timeline.to($keywordTexts[1], { y: '-100%', duration: 1, delay: 1, ease: 'none' }, 'seq-3');
          timeline.fromTo($keywordTexts[2], { y: '100%' }, { y: 0, duration: 1, delay: 1, ease: 'none' }, 'seq-3');
        }
      })();





      // invite
      (() => {
        const $article = $section.querySelector('.invite');
        const $title = $article.querySelector('.title');
        const $texts = $article.querySelector('.texts');
        const $textAll = $article.querySelectorAll('.text');
        const $btn = $article.querySelector('.btn-hud');
        const $meteor = $article.querySelector('.meteor');
        let $titleElts;

        let timeline, articleHeight;
        const titleText = $title.innerHTML;

        observing($meteor);

        // action
        state.on('scroll', (scrollTop) => {
          const rect = $article.getBoundingClientRect();
          if (rect.top < areaHeight && rect.bottom > 0) {
            const progress = -(rect.top - areaHeight*0.6) / areaHeight;
            timeline && timeline.progress(progress);
            // if ( progress > 1 || progress == 0 ) timeline.progress(1);

            if ( !isTablet ) $texts.style.transform = `translate3d(0, ${progress*-100}px, 0)`;
          } else {
            // timeline && timeline.progress(1);
          }
        });
        state.on('resize', (areaWidth, areaHeight) => {
          articleHeight = $article.offsetHeight;
        });

        state.on('mediachange', (media) => {
          $title.innerHTML = titleText;
          // motionLineText($title, '', '', false);
          if ( media == 'mobile' || media == 'tablet' ) {
            Array.from($title.children).forEach($span => {
              const inner = $span.innerHTML;
              const innerArray = inner.split('<br class="mobile">');

              $span.innerHTML = innerArray[0] + '</span>';

              const $nextSpan = document.createElement('span');
              $nextSpan.innerHTML = `<span>` + innerArray[1];
              $span.after($nextSpan);
            })
          }
          $titleElts = $title.querySelectorAll('span span');
          createTimeline();
        });

        // event
        const createTimeline = function () {
          timeline && timeline.kill();
          resetNodes($section);
          timeline = gsap.timeline({ paused: true });

          const titleEltsLength = $titleElts.length;
          $titleElts.forEach(($elt, index) => {
            timeline.fromTo($elt, { opacity: 0, y: '100%' }, { opacity: 1, y: 0, duration: 1, delay: index * 0.1, ease: 'cubic.out' }, 'seq-1');
          });
          timeline.fromTo($textAll[0], { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: titleEltsLength*0.1 + 0.2, ease: 'cubic.out' }, 'seq-1');
          timeline.fromTo($textAll[1], { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: titleEltsLength*0.1 + 0.3, ease: 'cubic.out' }, 'seq-1');
          timeline.fromTo($btn, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: titleEltsLength*0.1 + 0.4, ease: 'cubic.out' }, 'seq-1');
        }
      })();


    })();


    // spacehub
    (() => {
      const $section = $main.querySelector('.spacehub');
      const $bg = $section.querySelector('.bg');
      // const $ment = $section.querySelector('.ment');
      const $mentElts = $section.querySelectorAll('.ment span span');
      const $texts = $section.querySelector('.texts');
      const $text = $section.querySelector('.text');
      const $btn = $section.querySelector('.btn-hud');

      let timeline, sectionHeight;

      // action
      state.on('scroll', (scrollTop) => {
        const rect = $section.getBoundingClientRect();
        if (rect.top < areaHeight && rect.bottom > 0) {
          const progress = -(rect.top - areaHeight*0.5) / areaHeight;
          timeline && timeline.progress(progress);
          // if ( progress > 1 || progress == 0 ) timeline.progress(1);

          if ( !isTablet ) $texts.style.transform = `translate3d(0, ${progress*-120}px, 0)`;
        } else {
          // timeline && timeline.progress(1);
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
        timeline.fromTo($bg, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'quart.out' }, 'seq-1');
        timeline.to($mentElts[0], { opacity: 1, y: 0, duration: 1, ease: 'quart.out' }, 'seq-1');
        timeline.to($mentElts[1], { opacity: 1, y: 0, duration: 1, delay: .1, ease: 'quart.out' }, 'seq-1');
        timeline.fromTo($text, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: .3, ease: 'quart.out' }, 'seq-1');
        timeline.fromTo($btn, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: .4, ease: 'quart.out' }, 'seq-1');
        // if ( !isTablet ) {
        // } else {
        //   timeline.to($mentElts[2], { opacity: 1, y: 0, duration: 1, ease: 'quart.out' }, 'seq-1');
        //   timeline.to($mentElts[3], { opacity: 1, y: 0, duration: 1, delay: .1, ease: 'quart.out' }, 'seq-1');
        //   timeline.to($mentElts[4], { opacity: 1, y: 0, duration: 1, delay: .2, ease: 'quart.out' }, 'seq-1');
        //   timeline.to($mentElts[5], { opacity: 1, y: 0, duration: 1, delay: .3, ease: 'quart.out' }, 'seq-1');
        //   timeline.fromTo($text, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: .5, ease: 'quart.out' }, 'seq-1');
        //   timeline.fromTo($btn, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: .6, ease: 'quart.out' }, 'seq-1');
        // }
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




// controlVideo
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
  const options = { root: null, rootMargin: '0px', threshold: 0.5 }
  const observer = new IntersectionObserver(io, options);
  observer.observe($target);
}



// motionLineText 
function motionLineText ($textElem, $parentElem, delay, isObserver) {
  if ( !$textElem ) return;

  isObserver = isObserver == undefined ? true : isObserver;
  
  const textInner = $textElem.innerHTML;
  let textLinesTemp = '';
  // let isWithOtherTag = false;
  let isSetted = false;

  $textElem.childNodes.forEach(item => {
    if ( item.nodeName == '#text' ) {
      if ( item.textContent.trim() !== '' ) {
        const lines = extractLinesFromTextNode(item);
        textLinesTemp += `<span><span>${lines.join('</span></span> <span><span>')}</span></span>`;
      }
    } else if ( item.nodeName == 'SPAN' ) {
      isSetted = true;
      textLinesTemp += `<span>${item.textContent}</span>`;
    } else if ( item.nodeName == 'BR' ) {
      textLinesTemp += `<br>`
    } else {
      // isWithOtherTag = true;
    }
  });
  
  $textElem.innerHTML = textLinesTemp;
  // if ( isWithOtherTag ) {
  //     $textElem.innerHTML = `<span><span>${textInner}</span></span>`
  //     $textElem.classList.add('elt-other');
  // } else {
  //     $textElem.innerHTML = textLinesTemp;
  // }

  $parentElem && $parentElem.classList.add('elt-p');
  !isObserver ? $textElem.classList.add('elt-s') : $textElem.classList.add('elt-t');

  // observer
  if ( isObserver ) {
    const io = function (entries, observer) {
        entries.forEach(entry => {
            if (entry.intersectionRatio <= 0) return
            if (!entry.isIntersecting) return;
  
            if ( delay ) {
                setTimeout(() => {
                    $parentElem && $parentElem.classList.add('show');
                    $textElem.classList.add('show');    
                }, delay);
            } else {
                $parentElem && $parentElem.classList.add('show');
                $textElem.classList.add('show');
            }
        });
    }
    const options = { root: null, rootMargin: '0px', threshold: 0.5 }
    const observer = new IntersectionObserver(io, options);
    const $target = $parentElem ? $parentElem : $textElem;
    observer.observe($target);
  }

  // resize
  // function resize () {    
  //     $textElem.innerHTML = textInner;
  //     const textLines = extractLinesFromTextNode($textElem.childNodes[0]);
  //     $textElem.innerHTML = `<span><span>${textLines.join('</span></span> <span><span>')}</span></span>`;
  // }
  // if ( !isWithOtherTag ) {
  //     window.addEventListener('resize', resize);
  // }
}

function extractLinesFromTextNode ( textNode ) {
  if ( textNode.nodeType !== 3 ) {
    throw( new Error( "Lines can only be extracted from text nodes." ) );
  }
  
  textNode.textContent = collapseWhiteSpace( textNode.textContent );
  
  var textContent = textNode.textContent;
  var range = document.createRange();
  var lines = [];
  var lineCharacters = [];
  
  for ( var i = 0 ; i < textContent.length ; i++ ) {
    range.setStart( textNode, 0 );
    range.setEnd( textNode, ( i + 1 ) );
  
    var lineIndex = ( range.getClientRects().length - 1 );
    if ( ! lines[ lineIndex ] ) {
      lines.push( lineCharacters = [] );
    }
    lineCharacters.push( textContent.charAt( i ) );
  }
  
  
  lines = lines.map(
    function operator( characters ) {
  
      return( collapseWhiteSpace( characters.join( "" ) ) );
  
    }
  );
  
  return( lines );
}

function collapseWhiteSpace( value ) {
  return( value.trim().replace( /\s+/g, " " ) );
}


// gsap style reset
function resetNodes($target) {
  [].forEach.call($target.querySelectorAll('*'), ($node) => {
    $node._gsap && gsap.set($node, { clearProps: true });
  });
}



