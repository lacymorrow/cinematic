import Logger from 'electron-log';
import ptf from 'parse-torrent-filename';
import getUuidByString from 'uuid-by-string';
import { PARSE_METHOD } from '../config/config';
import { FileType, MediaType } from '../types/file';
import queue from './q';
import { getCachedObject, upsertMediaLibrary } from './store';
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

const parseFileMeta = ({ filename, ext }: MediaType) => {
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
			// const parsed = ptf(filename, { extra: /.+/ }, { extra: 'boolean' });
			const parsed = ptf(filename + ext);

			const extWithoutDot = ext.replace('.', '');

			if (String(parsed.title).endsWith(extWithoutDot)) {
				parsed.title = parsed.title.replace(extWithoutDot, '');
			}
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
	const { filename, filepath, ext } = media;

	// Generate a unique id for this file
	const id = getUuidByString(media.filepath);

	// Enforce a title at this point
	const title = prettyFileName(filename.replace(ext, ''));

	Logger.status(`Adding ${title} to library`);

	// METADATA DEFAULTS
	const now = Date.now();
	let updatedMedia: MediaType = {
		...media,
		id,
		title,
		prettyFileName: title,
		liked: false,
		dateAdded: now,
	};

	// check if path in cache
	const cached = getCachedObject(filepath);
	if (cached) {
		updatedMedia = {
			...updatedMedia,
			...cached,
			// Overwrite dateAdded and dateUpdated from cache
			dateAdded: now,
		};
	} else {
		// Gleen meta info from filename and update library
		const meta = parseFileMeta(updatedMedia);
		updatedMedia = { ...updatedMedia, ...meta };
	}

	// Add to library - allow showing in the ui before meta is retrieved
	upsertMediaLibrary(updatedMedia);
	Logger.status(`Updated metadata for ${updatedMedia.title}`);

	// If we're missing meta info, add to queue to retrieve it
	if (!updatedMedia.tmdb || !updatedMedia.omdb || !updatedMedia.trailers) {
		// Add to queue to retrieve meta info
		queue.add(updatedMedia);
	}
};
