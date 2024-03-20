// We import queue, so file shouldn't be named queue.ts
import { MediaType, SearchMetaType } from '@/types/file';
import Logger from 'electron-log';
import type { queueAsPromised } from 'fastq';
import fastq from 'fastq';
import { $errors, $messages } from '../config/strings';
import { fetchOMDB, fetchTMDB, fetchTrailer } from '../lib/fetch-meta';
import { OmdbType, TmdbType, TrailersType } from '../types/meta';
import {
	addGenre,
	getCachedObject,
	setCachedObject,
	upsertMediaLibrary,
} from './store-actions';

const qOMDB: queueAsPromised<SearchMetaType> = fastq.promise(
	async (meta: SearchMetaType) => {
		Logger.status(`${$messages.fetching_omdb}: ${meta.title}`);
		const cacheKey = `omdb-${meta.title}${meta.year ? `-${meta.year}` : ''}`;
		const cache = getCachedObject(cacheKey);
		if (cache) {
			return cache;
		}

		// Not in cache, fetch and cache
		const result = await fetchOMDB(meta);
		setCachedObject(cacheKey, result);

		return result;
	},
	1,
);

const qTMDB: queueAsPromised<SearchMetaType> = fastq.promise(
	async (meta: SearchMetaType) => {
		Logger.status(`${$messages.fetching_tmdb}: ${meta.title}`);
		const cacheKey = `tmdb-${meta.title}${meta.year ? `-${meta.year}` : ''}`;
		const cache = getCachedObject(cacheKey);
		if (cache) {
			return cache;
		}

		const result = await fetchTMDB(meta);
		setCachedObject(cacheKey, result);
		return result;
	},
	1,
);

const qTrailer: queueAsPromised<SearchMetaType> = fastq.promise(
	async (meta: SearchMetaType) => {
		Logger.status(`${$messages.fetching_trailers}: ${meta.title}`);
		const cacheKey = `trailer-${meta.title}${meta.year ? `-${meta.year}` : ''}`; // trailer-<title>-<year>
		const cache = getCachedObject(cacheKey);
		if (cache) {
			return cache;
		}

		const result = await fetchTrailer(meta);
		setCachedObject(cacheKey, result);
		return result;
	},
	1,
);

const onQueueError = (err: Error | undefined) => {
	Logger.error($errors.queue, err);
};

const onQueueSuccess = (result: MediaType) => {
	if (typeof result === 'object' && result.filepath) {
		// store result
		upsertMediaLibrary(result);
	}

	if (qTrailer.idle() && qTMDB.idle() && qOMDB.idle()) {
		Logger.status($messages.idle);
	}
};

// Add to queue
const add = (media: MediaType) => {
	if (!media.title) {
		return;
	}

	qTrailer
		.push(media)
		.then((result: TrailersType) => {
			return { ...media, trailers: result };
		})
		.then(onQueueSuccess)
		.catch(onQueueError);
	qTMDB
		.push(media)
		.then((result: TmdbType) => {
			// todo: track queue progress
			console.log('progress', qTMDB.length());
			return { ...media, tmdb: result };
		})
		.then(onQueueSuccess)
		.catch(onQueueError);
	qOMDB
		.push(media)
		.then((result: OmdbType) => {
			// Index genres
			if (result?.genre) {
				Object.values(result.genre).forEach((genre) => {
					addGenre({ genre, id: media.id });
				});
			}
			return { ...media, omdb: result };
		})
		.then(onQueueSuccess)
		.catch(onQueueError);
};

export default { add };
