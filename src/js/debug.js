import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';

import dat from 'dat.gui';
import Stats from 'stats.js';


const _DEBUG = location.search.indexOf('debug') > -1 && process.env.NODE_ENV !== 'production' ? {} : null;

if (_DEBUG) {
	document.documentElement.classList.add('_debug');

	_DEBUG.addControls = (camera, renderer, renderRequest) => {
		_DEBUG.controls = new OrbitControls(camera, renderer.domElement);
		_DEBUG.controls.addEventListener('change', function() {
			// console.log(camera.position);
			renderRequest();
		});
	};

	_DEBUG.gui = new dat.GUI();
	_DEBUG.gui.domElement.parentNode.style.zIndex = 100;
	
	_DEBUG.stats = new Stats();
	document.body.appendChild(_DEBUG.stats.dom);
	gsap.ticker.add(() => _DEBUG.stats.update());
}

window._DEBUG = _DEBUG;