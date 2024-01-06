/* eslint-disable no-underscore-dangle */
import { app } from 'electron';
import path from 'path';

export const __app = app.getAppPath();
export const __build = path.join(__app, 'build');
export const __src = path.join(__app, 'src');
export const __main = path.join(__src, 'main');
export const __renderer = path.join(__src, 'renderer');
export const __static = path.join(__src, 'static');

export const __resources = app.isPackaged
	? path.join(process.resourcesPath, 'assets')
	: path.join(__dirname, '../../assets');
