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

// Track pending results per media id so we can merge all three
// queue results without overwriting each other
interface PendingResult {
	omdb?: OmdbType;
	tmdb?: TmdbType;
	trailers?: TrailersType;
	remaining: number;
	media: MediaType;
}

const pending = new Map<string, PendingResult>();

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
		if (result) {
			setCachedObject(cacheKey, result);
		}
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
		if (result) {
			setCachedObject(cacheKey, result);
		}
		return result;
	},
	1,
);

const qTrailer: queueAsPromised<SearchMetaType> = fastq.promise(
	async (meta: SearchMetaType) => {
		Logger.status(`${$messages.fetching_trailers}: ${meta.title}`);
		const cacheKey = `trailer-${meta.title}${meta.year ? `-${meta.year}` : ''}`;
		const cache = getCachedObject(cacheKey);
		if (cache) {
			return cache;
		}

		const result = await fetchTrailer(meta);
		if (result) {
			setCachedObject(cacheKey, result);
		}
		return result;
	},
	1,
);

// Merge all collected queue results for a media id and upsert once.
// Called from both onResult and onQueueError when remaining hits 0.
const finalizePendingResult = (id: string) => {
	const entry = pending.get(id);
	if (!entry || entry.remaining > 0) return;

	const merged: MediaType = {
		...entry.media,
		...(entry.omdb && { omdb: entry.omdb }),
		...(entry.tmdb && { tmdb: entry.tmdb }),
		...(entry.trailers && { trailers: entry.trailers }),
	};
	pending.delete(id);
	upsertMediaLibrary(merged);

	if (qTrailer.idle() && qTMDB.idle() && qOMDB.idle()) {
		Logger.status($messages.idle);
	}
};

// Called when one of the three queues finishes for a given media id.
const onResult = (
	id: string,
	field: 'omdb' | 'tmdb' | 'trailers',
	result: any,
) => {
	const entry = pending.get(id);
	if (!entry) return;

	if (result) {
		entry[field] = result;
	}
	entry.remaining -= 1;

	// Index genres from OMDB as they arrive
	if (field === 'omdb' && result?.genre) {
		Object.values(result.genre).forEach((genre) => {
			addGenre({ genre: genre as string, id });
		});
	}

	finalizePendingResult(id);
};

const onQueueError = (id: string, err: Error | undefined) => {
	Logger.error($errors.queue, err);
	const entry = pending.get(id);
	if (entry) {
		entry.remaining -= 1;
		finalizePendingResult(id);
	}
};

// Add to queue
const add = (media: MediaType) => {
	if (!media.title) {
		return;
	}

	const { id } = media;

	// Register pending entry expecting 3 results
	pending.set(id, {
		remaining: 3,
		media,
	});

	qTrailer
		.push(media)
		.then((result: TrailersType) => onResult(id, 'trailers', result))
		.catch((err) => onQueueError(id, err));

	qTMDB
		.push(media)
		.then((result: TmdbType) => onResult(id, 'tmdb', result))
		.catch((err) => onQueueError(id, err));

	qOMDB
		.push(media)
		.then((result: OmdbType) => onResult(id, 'omdb', result))
		.catch((err) => onQueueError(id, err));
};

export default { add };
