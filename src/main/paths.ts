/* eslint-disable no-underscore-dangle */
import { app } from 'electron';
import path from 'path';

export const __assets = app.isPackaged
	? path.join(process.resourcesPath, 'assets')
	: path.join(__dirname, '../../assets');

export const __app = app.getAppPath();
export const __sounds = path.join(__assets, 'sounds') + path.sep;

export const rendererPaths = {
	sounds: __sounds,
};
