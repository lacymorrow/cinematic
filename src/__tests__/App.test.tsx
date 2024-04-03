import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import App from '../renderer/components/windows/main/App';

describe('App', () => {
	it('should render', () => {
		expect(render(<App />)).toBeTruthy();
	});
});
