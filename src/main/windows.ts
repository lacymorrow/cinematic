import { BrowserWindow } from 'electron';

interface Window {
	mainWindow: BrowserWindow | null;
	tray: any;
}

// Prevent window from being garbage collected
const windows: Window = {
	mainWindow: null,
	tray: null,
};

export default windows;
