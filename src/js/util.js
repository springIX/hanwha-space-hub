import { gsap } from 'gsap';


const $html = document.documentElement;

const userAgent = navigator.userAgent;
export const isMobile = (/(ip(ad|hone|od)|android)/i).test(userAgent) || (navigator.platform.toLowerCase() === 'macintel' && navigator.maxTouchPoints > 1);
export const isAndroid = (/android/i).test(userAgent);
export const isEdge = (/(edge|edg)/i).test(userAgent);
export const isFirefox = (/firefox/i).test(userAgent);
export const isSafari = (/safari/i).test(userAgent) && !(/chrome/i).test(userAgent);

isEdge && $html.classList.add('edge');
isSafari && $html.classList.add('safari');
isFirefox && $html.classList.add('firefox');


const $creator = document.createElement('div');


const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';


export function splitLetters ($node) {
	$node.innerHTML = '<span>' + $node.innerHTML.split('').map((letter) => letter === ' ' ? '&nbsp;' : letter).join('</span><span>') + '</span>';
	return [].slice.call($node.children);
}

export function splitLineToBlock ($node) {
	if ($node.length) {
		[].forEach.call($node, splitLineToBlock);
		return;
	}
	$node.innerHTML = `<span><span>${ $node.innerHTML.split(/<br *\/?>/).map((line) => (/^[\s\t]*$/).test(line) ? '&nbsp;' : line).join('</span></span><span><span>') }</span></span>`;
	$node.classList.add('line-splited');
}

export function createVideoNode (url) {
	const extension = url.match(/\.([a-z0-9]+)$/i)[1];
	$creator.innerHTML = `
		<video poster="${ url.replace(/\.[a-z0-9]+$/, '.webp') }" loop muted playsinline>
			<source src="${ url }" type="video/${ extension }" />
			${ extension === 'webm' ? `<source src="${ url.replace('webm', 'mp4') }" type="video/mp4" />` : '' }
		</video>
	`;
	const $video = $creator.children[0];
	$creator.innerHTML = '';
	return $video;
}

export function createSvgPathTimeline ($svg, _duration, backgroundColor) {
	const timeline = gsap.timeline({ paused: false });
	const duration = 1;
	const time = new Date().getTime();
	[].forEach.call($svg.querySelectorAll('path, circle, ellipse, rect, text'), ($node, index) => {
		let setted = false;
		if ($node.nodeName.toLowerCase() === 'path') {
			const pathLength = Math.ceil($node.getTotalLength());
			const nodeStyle = window.getComputedStyle($node);

			if (nodeStyle.strokeDasharray !== 'none') {
				const $mask = document.createElementNS(SVG_NAMESPACE, 'mask');
				$mask.setAttribute('id', 'dasharrayed-path-auto-mask-' + time + '-' + index);
				$mask.setAttribute('maskUnits', 'userSpaceOnUse');

				if ($node.getAttribute('transform')) {
					if ($node.getAttribute('d').indexOf('v') > -1) {
						let description = $node.getAttribute('d');
						const transform = $node.getAttribute('transform').match(/\(([0-9\.-]+) *,? *([0-9\.-]+)\)/).splice(1, 2).map((value) => parseFloat(value));
						const movePosition = description.match(/M([0-9\.-]+) +([0-9\.-]+)/).splice(1, 2).map((value) => parseFloat(value));
						description = description.replace(/M[0-9\.-]+ +[0-9\.-]+/, `M${ (movePosition[0] + transform[0]) } ${ (movePosition[1] + transform[1]) }`);
						$node.setAttribute('d', description);
						$node.removeAttribute('transform');
						$svg.appendChild($node);
					} else {
						const $group = document.createElementNS(SVG_NAMESPACE, 'g');
						$group.setAttribute('transform', $node.getAttribute('transform'));
						$node.removeAttribute('transform');
						$node.parentNode.insertBefore($group, $node);
						$group.appendChild($node);
					}
				}

				const $clone = $node.cloneNode(true);
				$clone.style.strokeDasharray = pathLength;
				$clone.style.stroke = '#fff';
				$clone.style.opacity = 1;
				$clone.removeAttribute('transform');
				$mask.appendChild($clone);

				let $defs = $svg.querySelector('defs');
				if (!$defs) {
					$defs = document.createElementNS(SVG_NAMESPACE, 'defs');
					$svg.insertBefore($defs, $svg.firstChild);
				}
				$defs.appendChild($mask);

				$node.setAttribute('mask', 'url(#' + $mask.id + ')');
				
				$node = $clone;
			}
			$node.style.strokeDasharray = pathLength;
			timeline.fromTo($node, { attr: { 'stroke-dashoffset': pathLength } }, { attr: { 'stroke-dashoffset': 0 }, duration: duration, ease: 'cubic.inOut', autoRound: false }, 0);

			const fill = nodeStyle['fill'];
			if (fill && fill !== 'none') {
				timeline.fromTo($node, { fill: backgroundColor || 'rgba(0, 0, 0, 0)' }, { fill: fill, duration: duration, ease: 'quad.out' }, 0);
			}
		} else {
			timeline.fromTo($node, { opacity: 0 }, { opacity: 1, duration: duration, ease: 'quad.out' }, 0);
		}
	});
	return timeline;
}

export function removeNode ($node) { 
	$node && $node.parentNode && $node.parentNode.removeChild($node);
}

export function getCountDown (scheduleTime) {
	let time  = Math.max(0, scheduleTime - new Date().getTime()) / 1000;

	let day = Math.floor(time / 86400);
	time -= day * 86400;

	let hour = Math.floor(time / 3600);
	time -= hour * 3600;

	let minute = Math.floor(time / 60);
	time -= minute * 60;

	let second = Math.floor(time);

	return [day, hour, minute, second].map(addZero);
}

export function addZero (value) { 
	return (value > 9 ? '' : '0') + value;
}

export function reflowTrick () { 
	document.body.offsetWidth;
}











