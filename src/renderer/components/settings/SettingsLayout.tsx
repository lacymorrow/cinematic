import { Separator } from '@/components/ui/separator';
import React from 'react';
import { Link } from 'react-router-dom';
import { SettingsSidebar } from './SettingsSidebar';
import SettingsAppearance from './appearance/SettingsAppearance';
import SettingsNotifications from './notifications/SettingsNotifications';
import SettingsDisplay from './display/SettingsDisplay';
import Icons from '../images/Icons';
import SettingsAbout from './about/SettingsAbout';

export const settingsNav = [
  {
    title: 'Appearance',
    href: '',
    element: <SettingsAppearance />,
  },
  {
    title: 'Notifications',
    href: 'notifications',
    element: <SettingsNotifications />,
  },
  {
    title: 'Display',
    href: 'display',
    element: <SettingsDisplay />,
  },
  {
    title: 'About',
    href: 'about',
    element: <SettingsAbout />,
  },
  {
    title: 'Back to Library',
    href: '/',
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="w-full max-w-7xl space-y-6 p-10 pb-16 mx-auto">
      <div className="flex justify-between items-start w-full">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your app settings and preferences.
          </p>
        </div>
        <Link
          to="/"
          className="flex justify-center items-center rounded-full border border-muted-foreground text-muted-foreground hover:text-foreground p-2"
        >
          {Icons.closeIcon}
        </Link>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SettingsSidebar items={settingsNav} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
