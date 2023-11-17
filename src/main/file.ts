// // Node file utilities
import fs from 'fs/promises';
import path from 'path';
import { FileType } from '@/types/file';
import {
  DEFAULT_FILE_META,
  DIRECTORY_IGNORE_PATTERN,
  FILE_SCAN_DEPTH,
  VALID_FILETYPES,
} from '../config/config';
import { ignorePattern } from './util';
import { addMediaToLibrary } from './media';
import { addPath } from './store';

const getExt = (mediaPath: string) =>
  path.extname(mediaPath).replace('.', '').toLowerCase();

// scan a file and add it to the movies state
export const scanFile = async (media: FileType) => {
  const { ext, filename, filepath } = media;
  // Ignore files that match the ignore pattern like "sample.avi"
  if (VALID_FILETYPES.includes(ext) && !ignorePattern(filename)) {
    // File is good! Add to library
    addMediaToLibrary({ ...DEFAULT_FILE_META, ext, filename, filepath });
  } else {
    console.warn(`Invalid filetype: ${ext} ${filepath}`);
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

    const ext = getExt(name);
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
        console.warn(`Ignoring directory: ${filename}`);
      }
    }
  });
};

// Begin the scanning operation on the movies folder
export const scanMedia = async (mediaPath: string) => {
  // check if path to movies folder is set
  if (!mediaPath) {
    console.error(
      'Please set path to movies folder in environment variable MOVIES_PATH',
    );
    return;
  }

  console.warn('Begin scanning media: ', mediaPath);

  // check if movies folder exists, readable, and is directory
  const stats = await fs.stat(mediaPath).catch((err) => {
    console.error(`Media is not accessible: ${err}`);
  });

  if (stats?.isDirectory()) {
    // scan movies folder
    // todo: reset movies state here, since we are beginning a new scan
    await scanDirectory(mediaPath, 0);
  } else if (stats?.isFile()) {
    const ext = getExt(mediaPath);
    scanFile({
      ext,
      filename: path.basename(mediaPath, ext),
      filepath: mediaPath,
    });
  }
};
