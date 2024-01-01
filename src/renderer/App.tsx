import { Layout } from '@/renderer/components/layout/Layout';
import { GlobalContextProvider } from '@/renderer/context/global-context';
import { Home } from '@/renderer/pages/Home';
import { Settings } from '@/renderer/pages/Settings';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';

import '@/renderer/styles/globals.scss';

export default function App() {
	return (
		<GlobalContextProvider>
			<Router>
				<Layout>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/settings" element={<Settings />} />
					</Routes>
				</Layout>
			</Router>
		</GlobalContextProvider>
	);
}
