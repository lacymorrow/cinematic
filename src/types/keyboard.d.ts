export interface CustomAcceleratorsType {
	quit?: string;
	reset?: string;
}

export interface KeyboardShortcut {
	action: keyof CustomAcceleratorsType;
	fn: () => void;
	allowUnbind?: boolean;
}
