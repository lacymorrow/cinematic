// bug: "no media" placeholder needs to be shown in all different sizes
// bug: cannot horizontally scroll in media browser "watch now"
// bug: files are added with zero metadata (allow this?)

// bug: we check for missing metadata every launch, even if they will always error (ex: GoPRO.mp4)

// todo: show log - remove console in favor of log
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
// todo: show current processing info
// todo: scrollarea for genre/playlist

import { Layout } from '@/renderer/components/layout/Layout';
import { GlobalContextProvider } from '@/renderer/context/global-context';
import { MainWindow } from '@/renderer/pages/MainWindow';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';

import '@/renderer/styles/globals.scss';

export default function App() {
	return (
		<GlobalContextProvider>
			<Router>
				<Layout>
					<Routes>
						<Route path="/" element={<MainWindow />} />
					</Routes>
				</Layout>
			</Router>
		</GlobalContextProvider>
	);
}
