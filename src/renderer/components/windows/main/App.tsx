// bug: files are added with zero metadata (allow this?)
// bug: we check for missing metadata every launch, even if they will always error (ex: GoPRO.mp4)
// bug: resizable layout doesn't save state

// todo: sort/filter media
// todo: search media  (?filter)
// todo: allow choosing movie poster size
// todo: improve list view of media
// todo: show all trailers in a slider
// todo: select multiple media
// todo: ratings
// todo: show/hide sidebar
// todo: show progress

import { ResizableLayout } from '@/renderer/components/layout/ResizableLayout';
import {
	nav,
	pathGenres,
	pathMedia,
	pathPlaylists,
	pathSettings,
	settingsNavItems,
} from '@/renderer/config/nav';
import { Genre } from '@/renderer/windows/main/pages/Genre';
import { Media } from '@/renderer/windows/main/pages/Media';
import {
	Route,
	RouterProvider,
	createHashRouter,
	createRoutesFromElements,
} from 'react-router-dom';

import { Home } from '@/renderer/components/pages/Home';

import { MainLayout } from '@/renderer/components/layout/MainLayout';
import SettingsLayout from '@/renderer/components/layout/SettingsLayout';
import ErrorPage from '@/renderer/components/pages/ErrorPage';
import '@/renderer/styles/globals.scss';
import { Playlist } from '@/renderer/windows/main/pages/Playlist';

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
			<Route path={`${pathSettings}`} element={<SettingsLayout />}>
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
		</Route>
	);

	const router = createHashRouter(createRoutesFromElements(cinematicRoutes));

	return (

			<RouterProvider router={router} />

	);
}
