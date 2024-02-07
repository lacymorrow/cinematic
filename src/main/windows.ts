import { BrowserWindow } from 'electron';

interface WindowsType {
	mainWindow: BrowserWindow | null;
	childWindow: BrowserWindow | null;
	tray: any;
}

// Prevent windows from being garbage collected
const w: WindowsType = {
	mainWindow: null,
	childWindow: null,
	tray: null,
};

export default w;
