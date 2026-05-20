// Polyfill TextEncoder / TextDecoder for jsdom (react-router 7 expects them).
import { TextDecoder, TextEncoder } from 'util';

if (typeof globalThis.TextEncoder === 'undefined') {
	(globalThis as unknown as { TextEncoder: typeof TextEncoder }).TextEncoder =
		TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
	(globalThis as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder =
		TextDecoder as unknown as typeof globalThis.TextDecoder;
}
