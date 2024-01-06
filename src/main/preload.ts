import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { ipcChannels } from '../config/ipc-channels';
import { SettingsType } from '../config/settings';

const channels = Object.values(ipcChannels);

const electronHandler = {
	isMac: process.platform === 'darwin',
	getAppName: () => ipcRenderer.invoke(ipcChannels.GET_APP_NAME),
	getAppMenu: () => ipcRenderer.invoke(ipcChannels.GET_APP_MENU),
	getSettings: () => ipcRenderer.invoke(ipcChannels.GET_SETTINGS),
	getMessages: () => ipcRenderer.invoke(ipcChannels.GET_MESSAGES),
	setSettings: (settings: Partial<SettingsType>) =>
		ipcRenderer.invoke(ipcChannels.SET_SETTINGS, settings),
	triggerAppMenuItemById: (id: string) =>
		ipcRenderer.send(ipcChannels.TRIGGER_APP_MENU_ITEM_BY_ID, id),
	openUrl: (url: string) => ipcRenderer.send(ipcChannels.OPEN_URL, url),
	ipcRenderer: {
		invoke(channel: string, ...args: unknown[]) {
			if (!channels.includes(channel)) {
				return;
			}
			ipcRenderer.send(channel, ...args);
		},
		on(channel: string, func: (...args: unknown[]) => void) {
			if (!channels.includes(channel)) {
				return;
			}
			const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
				func(...args);
			ipcRenderer.on(channel, subscription);

			return () => {
				ipcRenderer.removeListener(channel, subscription);
			};
		},
		once(channel: string, func: (...args: unknown[]) => void) {
			if (!channels.includes(channel)) {
				return;
			}
			ipcRenderer.once(channel, (_event, ...args) => func(...args));
		},
		removeAllListeners(channel: string) {
			ipcRenderer.removeAllListeners(channel);
		},
	},
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
