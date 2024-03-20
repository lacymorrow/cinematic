// // Node file utilities
import { FileType } from '@/types/file';
import Logger from 'electron-log';
import fs from 'fs/promises';
import path from 'path';
import {
	DEFAULT_FILE_META,
	DIRECTORY_IGNORE_PATTERN,
	FILE_SCAN_DEPTH,
	VALID_FILETYPES,
} from '../config/config';
import { $errors, $messages } from '../config/strings';
import { addMediaToLibrary } from './media';
import { addPath } from './store-actions';
import { ignorePattern } from './util';

// scan a file and add it to the movies state
export const scanFile = async (media: FileType) => {
	const { ext, filename, filepath } = media;

	// create a pretty file extension
	const extension = ext.replace('.', '').toLowerCase();

	// Ignore files that match the ignore pattern like "sample.avi"
	if (VALID_FILETYPES.includes(extension) && !ignorePattern(filename)) {
		// File is good! Add to library
		addMediaToLibrary({ ...DEFAULT_FILE_META, ext, filename, filepath });
	} else {
		// Report to user files that were not added
		Logger.status(`${$errors.invalidFiletype}: ${ext} ${filepath}`);
		// todo: add to invalid files state
	}
};

// scan users movies or media folder and create an array of video files
export const scanDirectory = async (directoryPath: string, depth: number) => {
	// store the path in the settings
	addPath(directoryPath);

	const files = await fs.readdir(directoryPath, { withFileTypes: true }); // https://stackoverflow.com/a/70328065/939330 - withFileTypes has isDirectory() method
	files.forEach((file) => {
		const { name } = file;

		// Skip dotfiles
		if (name.startsWith('.')) {
			return false;
		}

		const ext = path.extname(name);
		const filename = path.basename(name, ext); // Remove the extension
		const filepath = path.join(directoryPath, name);

		if (file.isFile()) {
			// File
			scanFile({ ext, filename, filepath });
		} else if (file.isDirectory() && depth < FILE_SCAN_DEPTH) {
			// Directory
			if (!DIRECTORY_IGNORE_PATTERN.includes(filename.toLowerCase())) {
				scanDirectory(filepath, depth + 1);
			} else {
				Logger.status($messages.ignoreFolder, filename);
			}
		}
	});
};

// Begin the scanning operation on the movies folder
export const scanMedia = async (mediaPath: string) => {
	Logger.status($messages.scanMedia, mediaPath);

	// check if movies folder exists, readable, and is directory
	const stats = await fs.stat(mediaPath).catch((err) => {
		Logger.error($errors.inaccessiblePath, err);
	});

	if (stats?.isDirectory()) {
		// scan movies folder
		// todo: reset movies state here, since we are beginning a new scan
		await scanDirectory(mediaPath, 0);
	} else if (stats?.isFile()) {
		const ext = path.extname(mediaPath);
		const filename = path.basename(mediaPath, ext); // Remove the extension

		scanFile({
			ext,
			filename,
			filepath: mediaPath,
		});
	}
};
