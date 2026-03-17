import 'electron-log';

declare module 'electron-log' {
	interface LogFunctions {
		status(...params: any[]): void;
	}
}

// electron-log/main re-exports from electron-log, so the augmentation
// above covers both imports. No separate augmentation needed.
