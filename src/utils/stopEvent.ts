export const stopEvent = (e: Event) => {
	console.warn('Blocked event', e);
	if (typeof e.preventDefault === 'function') {
		e.preventDefault();
	}
	if (typeof e.stopPropagation === 'function') {
		e.stopPropagation();
	}
};
