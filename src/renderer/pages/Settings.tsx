import { Outlet, Route, Routes } from 'react-router-dom';
import SettingsLayout, {
  settingsNav,
} from '../components/settings/SettingsLayout';

export default function Settings() {
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
