// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { ipcChannels } from '../config/ipc-channels';
import { SettingsType } from './store';

const channels = Object.values(ipcChannels);

const electronHandler = {
  getAppName: () => ipcRenderer.invoke(ipcChannels.GET_APP_NAME),
  getGenres: () => ipcRenderer.invoke(ipcChannels.GET_GENRES),
  getLibrary: () => ipcRenderer.invoke(ipcChannels.GET_LIBRARY),
  getPlaylists: () => ipcRenderer.invoke(ipcChannels.GET_PLAYLISTS),
  getSettings: () => ipcRenderer.invoke(ipcChannels.GET_SETTINGS),
  setSettings: (settings: Partial<SettingsType>) =>
    ipcRenderer.invoke(ipcChannels.SET_SETTINGS, settings),
  setMediaLike: (id: string, liked: boolean) =>
    ipcRenderer.invoke(ipcChannels.SET_MEDIA_LIKE, id, liked),
  addToPlaylist: (id: string, playlist: string) =>
    ipcRenderer.invoke(ipcChannels.ADD_TO_PLAYLIST, id, playlist),
  deletePlaylist: (id: string) =>
    ipcRenderer.send(ipcChannels.DELETE_PLAYLIST, id),
  addMediaPath: () => ipcRenderer.send(ipcChannels.ADD_MEDIA_PATH),
  addRecentlyViewed: (id: string) =>
    ipcRenderer.send(ipcChannels.ADD_TO_HISTORY, 'view', id),
  openMediaPath: () => ipcRenderer.send(ipcChannels.OPEN_MEDIA_PATH),
  openPath: (path: string) => ipcRenderer.send(ipcChannels.OPEN_PATH, path),
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