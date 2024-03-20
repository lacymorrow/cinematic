export const stopEvent = (event: Event) => {
	if (typeof event.preventDefault === 'function') {
		console.warn('Event prevented:', event);
		event.preventDefault();
	}
	if (typeof event.stopPropagation === 'function') {
		console.warn('Event stopped:', event);
		event.stopPropagation();
	}
};
