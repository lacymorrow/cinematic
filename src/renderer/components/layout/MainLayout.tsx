import AppStatus from '@/renderer/components/footer/AppStatus';
import { Footer } from '@/renderer/components/footer/Footer';
import OnlineStatus from '@/renderer/components/footer/OnlineStatus';
import { Menu } from '@/renderer/components/menu/Menu';

import React from 'react';
import { IsOnlineContextProvider } from 'react-is-online-context';
import { Outlet } from 'react-router-dom';

// We can't use the ScrollArea here or the scroll will persist between navigations
export function MainLayout({ children }: { children?: React.ReactNode }) {
	return (
		<div className="w-full h-full flex flex-col">
			<Menu className="shrink-0" />
			<div className="border-t grow flex min-h-0">
				<div className="grow min-w-0">{children || <Outlet />}</div>
			</div>
			<Footer>
				<IsOnlineContextProvider>
					<OnlineStatus />
				</IsOnlineContextProvider>

				<AppStatus />
			</Footer>
		</div>
	);
}
