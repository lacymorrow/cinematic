import { BrowserWindow } from 'electron';

interface Windows {
	mainWindow: BrowserWindow | null;
}

// Prevent windows from being garbage collected
const windows: Windows = {
	mainWindow: null,
};

export default windows;
