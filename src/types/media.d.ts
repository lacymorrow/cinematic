import { MediaType } from './file';

export interface CollectionItemType {
	id: string;
	name: string;
	values: string[];
}

export type LibraryType = MediaType[];

export type CollectionType = CollectionItemType[];
