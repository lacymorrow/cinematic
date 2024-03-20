// todo: menubar ellipsis on overflow
import { MainLayout } from '@/renderer/components/layout/MainLayout';
import { Home } from '@/renderer/components/pages/Home';
import {
	Route,
	RouterProvider,
	createHashRouter,
	createRoutesFromElements,
} from 'react-router-dom';

import SettingsLayout from '@/renderer/components/layout/SettingsLayout';
import { settingsNavItems } from '@/renderer/config/nav';
import '@/renderer/styles/globals.scss';

export default function App() {
	const routes = (
		<Route path="/" element={<MainLayout />}>
			<Route path="settings" element={<SettingsLayout />}>
				{settingsNavItems.map((item) => {
					/* Dynamically add routes for settings */
					return (
						<Route
							key={item.title}
							path={item.href}
							element={<>{item.element}</>}
							{...(item.index ? { index: true } : {})}
						/>
					);
				})}
			</Route>

			<Route index element={<Home />} />
			<Route path="*" element={<Home />} />
		</Route>
	);

	const router = createHashRouter(createRoutesFromElements(routes));

	return (
		<>
			<RouterProvider router={router} />
		</>
	);
}
