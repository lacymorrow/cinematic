// Mock ESM-only packages that are incompatible with Jest's CJS transform.
jest.mock('react-is-online-context', () => ({
	useIsOnline: () => true,
}));

jest.mock('uuid', () => ({
	v4: () => 'test-uuid-v4',
	v1: () => 'test-uuid-v1',
}));
