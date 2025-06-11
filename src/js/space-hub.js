import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/parallax';
import 'swiper/css/mousewheel';

import '../scss/space-hub.scss';

import './debug.js';
import './common.js';
import './_main.js';
import './_main-spacekids.js';
import './_space-hub.js';
import './_launch.js';
import './_satellite.js';
import './_exploration.js';
import './_media-room.js';
import './_space-kids.js';
import './_space-kids-introduce.js';
import './_space-kids-program.js';
import './_space-kids-mediaroom.js';
import './_space-kids-apply.js';

var xmlHttp;
function srvTime(){
    try {
        //FF, Opera, Safari, Chrome
        xmlHttp = new XMLHttpRequest();
    }
    catch (err1) {
        //IE
        try {
            xmlHttp = new ActiveXObject('Msxml2.XMLHTTP');
        }
        catch (err2) {
            try {
                xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
            }
            catch (eerr3) {
                //AJAX not supported, use CPU time.
                alert("AJAX not supported");
            }
        }
    }
    xmlHttp.open('HEAD',window.location.href.toString(),false);
    xmlHttp.setRequestHeader("Content-Type", "text/html");
    xmlHttp.send('');
    return xmlHttp.getResponseHeader("Date");
}

var st = srvTime();
var stDate = new Date(st);

window.addEventListener('load', () => {
  const $skBeforeOpen = document.querySelectorAll('.sk-before-open');
  const $skAfterOpen = document.querySelectorAll('.sk-after-open');

  if ( (new Date(st)).getTime() > (new Date('2024-05-11T15:00:00.000Z')).getTime() ) {
    $skBeforeOpen.forEach($node => $node.remove())
  } else {
    $skAfterOpen.forEach($node => $node.remove())
  }
})