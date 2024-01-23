import { MainLayout } from '@/renderer/windows/main/Layout';
import { Home } from '@/renderer/windows/main/pages/Home';
import { Settings } from '@/renderer/windows/main/pages/Settings';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';

import { Layout } from '@/renderer/components/layout/Layout';
import '@/renderer/styles/globals.scss';

export default function App() {
	return (
		<Layout>
			<Router>
				<MainLayout>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/settings" element={<Settings />} />
					</Routes>
				</MainLayout>
			</Router>
		</Layout>
	);
}
