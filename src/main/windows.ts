import { BrowserWindow } from 'electron';

interface Windows {
	mainWindow: BrowserWindow | null;
	tray: any;
}

// Prevent windows from being garbage collected
const windows: Windows = {
	mainWindow: null,
	tray: null,
};

export default windows;
