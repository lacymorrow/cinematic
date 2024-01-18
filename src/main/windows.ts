import { BrowserWindow } from 'electron';

interface WindowsType {
	mainWindow: BrowserWindow | null;
	tray: any;
}

// Prevent windows from being garbage collected
const windows: WindowsType = {
	mainWindow: null,
	tray: null,
};

export class Windows {
	main: BrowserWindow | null;

	tray: any;

	constructor() {
		this.main = null;
		this.tray = null;
	}

	get mainWindow() {
		return this.main;
	}

	set mainWindow(window: BrowserWindow | null) {
		this.main = window;
	}

	get t(): any {
		return this.tray;
	}
}

export default windows;
