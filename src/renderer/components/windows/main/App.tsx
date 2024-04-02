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
import ErrorPage from '@/renderer/components/pages/ErrorPage';
import { settingsNavItems } from '@/renderer/config/nav';
import '@/renderer/styles/globals.scss';

export default function App() {
	const index =
		settingsNavItems.find((item) => item.index) || settingsNavItems[0];

	const routes = (
		<Route path="/" element={<MainLayout />} errorElement={<ErrorPage />}>
			<Route path="settings" element={<SettingsLayout />}>
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

				{index && (
					<>
						<Route index path="*" element={<>{index.element}</>} />
					</>
				)}
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
