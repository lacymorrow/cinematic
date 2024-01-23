import 'electron-log/main';

declare module 'electron-log/main' {
	interface LogFunctions {
		status(...params: any[]): void;
	}
}
