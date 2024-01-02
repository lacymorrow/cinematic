import { BrowserWindow } from 'electron';

interface Window {
	mainWindow: BrowserWindow | null;
}

// Prevent window from being garbage collected
const windows: Window = {
	mainWindow: null,
};

export default windows;
