import 'electron-log';
import 'electron-log/main';

declare module 'electron-log' {
	interface LogFunctions {
		status(...params: any[]): void;
	}
}

declare module 'electron-log/main' {
	interface LogFunctions {
		status(...params: any[]): void;
	}
}
