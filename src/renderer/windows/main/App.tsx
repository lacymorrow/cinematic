// todo: menubar ellipsis on overflow
import { MainLayout } from '@/renderer/components/layout/MainLayout';
import { Home } from '@/renderer/components/pages/Home';
import {
	Route,
	RouterProvider,
	createMemoryRouter,
	createRoutesFromElements,
} from 'react-router-dom';

import SettingsLayout from '@/renderer/components/layout/SettingsLayout';
import { SettingsApplication } from '@/renderer/components/pages/settings/general/SettingsApplication';
import { settingsNavItems } from '@/renderer/config/nav';
import '@/renderer/styles/globals.scss';

export default function App() {
	const routes = (
		<Route path="/" element={<MainLayout />}>
			<Route path="settings" element={<SettingsLayout />}>
				<Route index element={<SettingsApplication />} />
				{settingsNavItems.map((item) => {
					/* Dynamically add routes for settings */
					return (
						<Route
							key={item.title}
							path={item.href}
							element={<>{item.element}</>}
						/>
					);
				})}
			</Route>

			<Route index element={<Home />} />
			<Route path="*" element={<Home />} />
		</Route>
	);

	const router = createMemoryRouter(createRoutesFromElements(routes));

	return (
		<>
			<RouterProvider router={router} />
		</>
	);
}
