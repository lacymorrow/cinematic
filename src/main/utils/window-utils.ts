// https://github.com/sindresorhus/electron-util/blob/main/source/main/window.ts
import { BrowserWindow, Rectangle, Size, screen } from 'electron';
import { is } from '../util';

export type GetWindowBoundsCenteredOptions = {
	/**
	The window to get the bounds of.

	Default: Current window
	*/
	readonly window?: BrowserWindow;

	/**
	Set a new window size.

	Default: Size of `window`

	@example
	```
	{width: 600, height: 400}
	```
	*/
	readonly size?: Size;

	/**
	Use the full display size when calculating the position.
	By default, only the workable screen area is used, which excludes the Windows taskbar and macOS dock.

	@default false
	*/
	readonly useFullBounds?: boolean;
};

export type CenterWindowOptions = {
	/**
	The window to center.

	Default: Current window
	*/
	readonly window?: BrowserWindow;

	/**
	Set a new window size.

	Default: Size of `window`

	@example
	```
	{width: 600, height: 400}
	```
	*/
	readonly size?: Size;

	/**
	Animate the change.

	@default false
	*/
	readonly animated?: boolean;

	/**
	Use the full display size when calculating the position.
	By default, only the workable screen area is used, which excludes the Windows taskbar and macOS dock.

	@default false
	*/
	readonly useFullBounds?: boolean;
};

export const activeWindow = () => BrowserWindow.getFocusedWindow();

/**
@returns The height of the menu bar on macOS, or `0` if not macOS.
*/
export const menuBarHeight = () =>
	is.macos ? screen.getPrimaryDisplay().workArea.y : 0;

/**
Get the [bounds](https://electronjs.org/docs/api/browser-window#wingetbounds) of a window as if it was centered on the screen.

@returns Bounds of a window.
*/
export const getWindowBoundsCentered = (
	options?: GetWindowBoundsCenteredOptions,
): Rectangle => {
	const window = options?.window ?? activeWindow();
	if (!window) {
		throw new Error('No active window');
	}

	const [width, height] = window.getSize();
	const windowSize = (options?.size ?? { width, height }) as Size;
	const screenSize = screen.getDisplayNearestPoint(
		screen.getCursorScreenPoint(),
	).workArea;
	const x = Math.floor(
		screenSize.x + screenSize.width / 2 - (windowSize.width ?? 0) / 2,
	);
	const y = Math.floor(
		(screenSize.height + screenSize.y) / 2 - (windowSize.height ?? 0) / 2,
	);

	return {
		x,
		y,
		...windowSize,
	};
};

/**
Center a window on the screen.
*/
export const centerWindow = (options?: CenterWindowOptions) => {
	const window = options?.window ?? activeWindow();
	if (!window) {
		throw new Error('No active window');
	}

	const opts = {
		window,
		animated: false,
		...options,
	};

	const bounds = getWindowBoundsCentered(opts);
	window.setBounds(bounds, opts.animated);
};

export const forEachWindow = (callback: (window: BrowserWindow) => void) => {
	BrowserWindow.getAllWindows().forEach((win) => {
		callback(win);
	});
};
