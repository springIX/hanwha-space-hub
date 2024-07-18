export const states = {
	media: ''
};

const events = {
	enter: [],
	display: [],
	leave: [],
	scroll: [],
	resize: [],
	mediachange: []
};

export const on = (type, handler) => {
	if (events[type]) {
		events[type].push(handler);
	}
}

export const off = (type, handler) => {
	if (events[type]) {
		const index = events[type].indexOf(handler);
		if (index > -1) {
			events[type].splice(index, 1);
		}
	}
}

export const dispatch = (type, ...args) => {
	if (type === 'mediachange') {
		states.media = args[0];
	}
	for (let i = 0, numHandlers = events[type].length; i < numHandlers; i++) {
		events[type][i](...args);
	}
}

export const clear = () => {
	for (let type in events) {
		if (type !== 'enter') {
			events[type].length = 0;
		}
	}
}





