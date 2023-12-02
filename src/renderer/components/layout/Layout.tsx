import { Toaster } from '@/components/ui/toaster';
import { Menu } from '@/renderer/components/menu/Menu';
import { AppContextProvider } from '@/renderer/context/app-context';
import React from 'react';
import AppStatus from '../info/AppStatus';
import OnlineStatus from '../info/OnlineStatus';
import { Footer } from './Footer';

// We can't use the ScrollArea here or the scroll will persist between navigations
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full flex flex-col">
      <Menu className="shrink-0" />
      <div className="border-t grow flex min-h-0">
        <div className="bg-background grow min-w-0">
          <div className="flex h-full">{children}</div>
        </div>
      </div>
      <Footer>
        <OnlineStatus />
        <AppContextProvider>
          <AppStatus />
        </AppContextProvider>
      </Footer>
      <Toaster />
    </div>
  );
}
