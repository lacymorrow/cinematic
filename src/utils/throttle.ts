// https://underscorejs.org/docs/modules/throttle.html
// Allows for leading and trailing throttling

const now = () => new Date().getTime();

export const throttle = (
	func: Function,
	wait: number,
	options: { leading?: boolean; trailing?: boolean } = {
		leading: false,
		trailing: true,
	},
) => {
	let timeout: any;
	let context: any;
	let args: any;
	let result: any;
	let previous = 0;
	const opts = options || {};

	const later = function () {
		previous = opts.leading === false ? 0 : now();
		timeout = null;
		result = func.apply(context, args);
		if (!timeout) {
			context = null;
			args = null;
		}
	};

	const throttled = function (...props: any[]) {
		const currentTime = now();
		if (!previous && opts.leading === false) previous = currentTime;
		const remaining = wait - (currentTime - previous);
		// @ts-ignore
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		context = this;
		args = props;
		if (remaining <= 0 || remaining > wait) {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
			previous = currentTime;
			result = func.apply(context, args);
			if (!timeout) {
				context = null;
				args = null;
			}
		} else if (!timeout && opts.trailing !== false) {
			timeout = setTimeout(later, remaining);
		}
		return result;
	};

	// eslint-disable-next-line func-names
	throttled.cancel = function (): void {
		if (timeout) {
			clearTimeout(timeout);
		}
		previous = 0;
		timeout = null;
		context = null;
		args = null;
	};

	return throttled;
};

// Simple throttle function
// export const throttle = (fn: Function, wait: number) => {
// 	let timeout: any;
// 	return (...args: any[]) => {
// 		if (!timeout) {
// 			timeout = setTimeout(() => {
// 				fn(...args);
// 				timeout = null;
// 			}, wait);
// 		}
// 	};
// };
