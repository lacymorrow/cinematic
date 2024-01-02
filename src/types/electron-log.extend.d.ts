import 'electron-log';

declare module 'electron-log' {
	interface LogFunctions {
		status(...params: any[]): void;
	}
}
