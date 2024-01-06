import path from 'path';
import { ipcChannels } from '../config/ipc-channels';

import { __static } from './paths';
import { getSetting } from './store';
import windows from './windows';

const preload = () => {
	windows.mainWindow?.webContents.send(
		ipcChannels.PRELOAD_SOUNDS,
		path.join(__static, 'sounds') + path.sep,
	);
};

const play = (sound: string) => {
	if (getSetting('allowSounds')) {
		windows.mainWindow?.webContents.send(ipcChannels.PLAY_SOUND, sound);
	}
};

export default {
	preload,
	play,
};
