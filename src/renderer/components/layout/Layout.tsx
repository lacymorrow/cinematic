import { Toaster } from '@/components/ui/toaster';
import AppStatus from '@/renderer/components/footer/AppStatus';
import { Footer } from '@/renderer/components/footer/Footer';
import OnlineStatus from '@/renderer/components/footer/OnlineStatus';
import { Menu } from '@/renderer/components/menu/Menu';
import { AppContextProvider } from '@/renderer/context/app-context';

import React from 'react';
import { IsOnlineContextProvider } from 'react-is-online-context';

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
				<IsOnlineContextProvider>
					<OnlineStatus />
				</IsOnlineContextProvider>
				<AppContextProvider>
					<AppStatus />
				</AppContextProvider>
			</Footer>
			<Toaster />
		</div>
	);
}
