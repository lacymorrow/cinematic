// Mappings for sounds in src/renderer/lib/sounds.ts
import { ipcChannels } from '../config/ipc-channels';

import { getSetting } from './store';
import windows from './windows';

const play = (sound: string) => {
	if (getSetting('allowSounds')) {
		windows.mainWindow?.webContents.send(ipcChannels.PLAY_SOUND, sound);
	}
};

export default {
	play,
};
