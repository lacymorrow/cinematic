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
import { Layout } from '@/renderer/components/layout/Layout';
import { ResizableLayout } from '@/renderer/components/ui/ResizableLayout';
import { nav } from '@/renderer/config/nav';
import { GlobalContextProvider } from '@/renderer/context/global-context';
import { Genre } from '@/renderer/pages/Genre';
import { Media } from '@/renderer/pages/Media';
import Settings from '@/renderer/pages/Settings';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import { Playlist } from './pages/Playlist';

import '@/renderer/styles/globals.scss';

export default function App() {
	return (
		<GlobalContextProvider>
			<Router>
				<Layout>
					<Routes>
						{nav.map((item) => {
							return (
								<Route
									key={item.name}
									path={item.path}
									element={<ResizableLayout>{item.element}</ResizableLayout>}
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
					</Routes>
				</Layout>
			</Router>
		</GlobalContextProvider>
	);
}
