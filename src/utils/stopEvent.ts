export const stopEvent = (event: Event) => {
	if (typeof event.preventDefault === 'function') {
		event.preventDefault();
	}
	if (typeof event.stopPropagation === 'function') {
		event.stopPropagation();
	}
};
