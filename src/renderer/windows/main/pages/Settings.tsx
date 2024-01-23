import SettingsLayout, {
	settingsNav,
} from '@/renderer/components/settings/SettingsLayout';
import { Outlet, Route, Routes } from 'react-router-dom';

export function Settings() {
	return (
		<SettingsLayout>
			<Routes>
				{settingsNav.map((item) => {
					return (
						<Route key={item.title} path={item.href} element={item.element} />
					);
				})}
			</Routes>
			<Outlet />
		</SettingsLayout>
	);
}
