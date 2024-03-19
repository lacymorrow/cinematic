// bug: files are added with zero metadata (allow this?)

// bug: we check for missing metadata every launch, even if they will always error (ex: GoPRO.mp4)

// todo: sort/filter media
// todo: search media  (?filer)
// todo: allow choosing movie poster size
// todo: improve list view of media
// todo: show all trailers in a slider
// todo: app history
// todo: select multiple media
// todo: ratings
// todo: show/hide sidebar
// todo: show progress
// todo: scrollarea for genre/playlist

import {
	pathGenres,
	pathMedia,
	pathPlaylists,
	pathSettings,
} from '@/config/nav';
import { nav } from '@/renderer/components/layout/nav';
import { ResizableLayout } from '@/renderer/components/ui/ResizableLayout';
import { Genre } from '@/renderer/windows/main/pages/Genre';
import { Media } from '@/renderer/windows/main/pages/Media';
import { Settings } from '@/renderer/windows/main/pages/Settings';
import {
	Route,
	RouterProvider,
	createHashRouter,
	createRoutesFromElements,
} from 'react-router-dom';

// todo: menubar ellipsis on overflow
import { Home } from '@/renderer/components/pages/Home';

import { Layout } from '@/renderer/components/layout/Layout';
import { MainLayout } from '@/renderer/components/layout/MainLayout';
import SettingsLayout from '@/renderer/components/layout/SettingsLayout';
import { SettingsApplication } from '@/renderer/components/pages/settings/general/SettingsApplication';
import { settingsNavItems } from '@/renderer/config/nav';
import '@/renderer/styles/globals.scss';
import { Playlist } from './pages/Playlist';

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

	const cinematicRoutes = (
		<Route path="/" element={<MainLayout />}>
			{nav.map((item) => {
				return (
					<Route
						key={item.name}
						path={item.path}
						element={<ResizableLayout>{item.element}</ResizableLayout>}
						{...(item.index ? { index: true } : {})}
					/>
				);
			})}
			<Route path={pathGenres}>
				<Route
					path=":id"
					element={
						<ResizableLayout>
							<Genre />
						</ResizableLayout>
					}
				/>
			</Route>
			<Route path={pathPlaylists}>
				<Route
					path=":id"
					element={
						<ResizableLayout>
							<Playlist />
						</ResizableLayout>
					}
				/>
			</Route>
			<Route path={pathMedia}>
				<Route path=":id" element={<Media />} />
			</Route>
			<Route path={`${pathSettings}/*`} element={<Settings />} />
		</Route>
	);

	const router = createHashRouter(createRoutesFromElements(cinematicRoutes));

	return (
		<Layout>
			<RouterProvider router={router} />
		</Layout>
	);
}
