import { getOS } from './getOS';

export type PlatformOS = 'mac' | 'windows' | 'linux';

export type PlatformInfo = {
	os: PlatformOS;
	osVersion: string;
	darwinMajor: number; // macOS only: Darwin kernel major version
	windowsBuild: number; // Windows only: build number
	isMac: boolean;
	isWindows: boolean;
	isLinux: boolean;
};

/**
 * Parse OS release string into structured platform info.
 * Call from the main process where `os.release()` is available.
 */
export function getPlatformInfo(osRelease: string): PlatformInfo {
	const os = getOS() as PlatformOS;
	const parts = osRelease.split('.');

	return {
		os,
		osVersion: osRelease,
		darwinMajor: os === 'mac' ? parseInt(parts[0] ?? '0', 10) : 0,
		windowsBuild: os === 'windows' ? parseInt(parts[2] ?? '0', 10) : 0,
		isMac: os === 'mac',
		isWindows: os === 'windows',
		isLinux: os === 'linux',
	};
}

/**
 * Returns the native window corner radius for the given platform.
 *
 * macOS Tahoe (Darwin 25+): 22px
 * macOS Big Sur–Sequoia (Darwin 20–24): 10px
 * macOS pre-Big Sur (Darwin <20): 6px
 * Windows 11 (build 22000+): 8px
 * Windows 10 and below: 4px
 * Linux: 4px
 */
export function getNativeWindowBorderRadius(platform: PlatformInfo): string {
	if (platform.isMac) {
		if (platform.darwinMajor >= 25) return '22px';
		if (platform.darwinMajor >= 20) return '10px';
		return '6px';
	}

	if (platform.isWindows) {
		if (platform.windowsBuild >= 22000) return '8px';
		return '4px';
	}

	return '4px';
}
