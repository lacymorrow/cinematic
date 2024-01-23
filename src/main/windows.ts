import { BrowserWindow } from 'electron';

interface WindowsType {
	mainWindow: BrowserWindow | null;
	childWindow: BrowserWindow | null;
	tray: any;
}

// Prevent windows from being garbage collected
const windows: WindowsType = {
	mainWindow: null,
	childWindow: null,
	tray: null,
};

export class Windows {
	main: BrowserWindow | null;

	child: BrowserWindow | null;

	tray: any;

	constructor() {
		this.main = null;
		this.child = null;
		this.tray = null;
	}

	get mainWindow() {
		return this.main;
	}

	set mainWindow(window: BrowserWindow | null) {
		this.main = window;
	}

	get childWindow() {
		return this.child;
	}

	set childWindow(window: BrowserWindow | null) {
		this.child = window;
	}

	get t(): any {
		return this.tray;
	}
}

export default windows;
