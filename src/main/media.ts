import ptf from 'parse-torrent-filename';
import getUuidByString from 'uuid-by-string';
import { PARSE_METHOD } from '../config/config';
import { FileType, MediaType } from '../types/file';
import queue from './q';
import { upsertMediaLibrary, getCachedObject } from './store';
import { fileNameRegex, isDigit } from './util';

export const prettyFileName = (name: string) => {
  // replace periods, underscores and dashes with spaces
  return name
    .replace(/\.|_|-/g, ' ')
    .split(' ')
    .map((word) => {
      // Capitalize first letter of each word
      return word.charAt(0).toUpperCase() + word.toLowerCase().slice(1);
    })
    .join(' ');
};

const parseFileMeta = (filename: string) => {
  let meta: Partial<MediaType> = {
    filename,
  };

  switch (PARSE_METHOD) {
    case 'regex': {
      const match = fileNameRegex.exec(filename);
      if (match) {
        const [title, _other, year] = match;
        meta.title = title;
        if (match.length > 1 && isDigit(year)) {
          meta.year = year;
        }
      }

      break;
    }

    case 'parse':
    default: {
      const parsed = ptf(filename, { extra: /.+/ }, { extra: 'boolean' });

      meta = {
        ...meta,
        ...parsed,
      };

      break;
    }
  }

  return meta;
};

// First add to library, then retrieve meta info, either from cache or from the internet
export const addMediaToLibrary = (media: FileType) => {
  const { filename, filepath } = media;

  // Generate a unique id for this file
  const id = getUuidByString(media.filepath);

  // Enforce a title at this point
  const title = prettyFileName(filename);

  // METADATA DEFAULTS
  let updatedMedia: MediaType = {
    ...media,
    id,
    title,
    prettyFileName: title,
    liked: false,
    dateAdded: Date.now(),
    dateUpdated: Date.now(),
  };

  // check if path in cache
  const cached = getCachedObject(filepath);
  if (cached) {
    updatedMedia = { ...updatedMedia, ...cached };
  } else {
    // Gleen meta info from filename and update library
    const meta = parseFileMeta(filename);
    updatedMedia = { ...updatedMedia, ...meta };
  }

  // Add to library - allow showing in the ui before meta is retrieved
  upsertMediaLibrary(updatedMedia);

  // If we're missing meta info, add to queue to retrieve it
  if (!updatedMedia.tmdb || !updatedMedia.omdb || !updatedMedia.trailers) {
    // Add to queue to retrieve meta info
    queue.add(updatedMedia);
  }
};
