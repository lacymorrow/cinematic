// Whitelist channels for IPC
export type Channels = string;
export const ADD_MEDIA_PATH = 'add-media-path';
export const LIBRARY_UPDATED = 'library-updated';
export const CLEAR_LIBRARY = 'clear-library';

export const GET_APP_NAME = 'get-app-name';
export const GET_LIBRARY = 'get-library';
export const GET_GENRES = 'get-genres';
export const GET_PLAYLISTS = 'get-playlists';
export const GET_SETTINGS = 'get-settings';
export const SET_SETTINGS = 'set-settings';

export const SET_MEDIA_LIKE = 'set-media-like';
export const ADD_TO_HISTORY = 'add-to-history';
export const ADD_TO_PLAYLIST = 'add-to-playlist';
export const DELETE_PLAYLIST = 'delete-playlist';
export const OPEN_MEDIA_PATH = 'open-media-path';
export const OPEN_PATH = 'open-path';
export const OPEN_URL = 'open-url';

export const ipcChannels = {
  // main -> renderer
  LIBRARY_UPDATED,

  // renderer -> main
  CLEAR_LIBRARY,

  GET_APP_NAME,
  GET_GENRES,
  GET_LIBRARY,
  GET_PLAYLISTS,
  GET_SETTINGS,
  SET_SETTINGS,
  SET_MEDIA_LIKE,
  ADD_TO_HISTORY,
  ADD_TO_PLAYLIST,
  DELETE_PLAYLIST,
  ADD_MEDIA_PATH,
  OPEN_MEDIA_PATH,
  OPEN_PATH,
  OPEN_URL,
};