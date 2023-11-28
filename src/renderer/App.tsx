// bug: "no media" placeholder needs to be shown in all different sizes
// bug: cannot horizontally scroll in media browser "watch now"
// bug: files are added with zero metadata (allow this?)

// todo: network status
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
import { MediaLayout } from '@/renderer/components/layout/MediaLayout';
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
                  element={<MediaLayout>{item.element}</MediaLayout>}
                />
              );
            })}
            <Route path="/genres">
              <Route
                path=":id"
                element={
                  <MediaLayout>
                    <Genre />
                  </MediaLayout>
                }
              />
            </Route>
            <Route path="/playlists">
              <Route
                path=":id"
                element={
                  <MediaLayout>
                    <Playlist />
                  </MediaLayout>
                }
              />
            </Route>
            <Route path="/media">
              <Route
                path=":id"
                element={
                  <MediaLayout>
                    <Media />
                  </MediaLayout>
                }
              />
            </Route>
            <Route path="/settings/*" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </GlobalContextProvider>
  );
}
