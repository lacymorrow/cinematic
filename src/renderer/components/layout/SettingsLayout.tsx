import { Separator } from '@/components/ui/separator';
import { $settings } from '@/config/strings';
import { ScrollArea } from '@/renderer/components/ui/ScrollPane';
import { SidebarNav } from '@/renderer/components/ui/SidebarNav';
import { settingsNavItems } from '@/renderer/config/nav';
import { ResetIcon } from '@radix-ui/react-icons';
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

interface SettingsLayoutProps {
	children?: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
	const { pathname: location } = useLocation(); // We use this to reset the scroll position when the location changes
	return (
		<>
			<div className="h-full flex flex-col justify-stretch">
				<div className="space-y-0.5 p-4">
					<h2 className="text-xl font-bold tracking-tight">
						{$settings.title}
					</h2>
					<p className="text-sm text-muted-foreground">
						{$settings.description}
					</p>
				</div>
				<Separator />
				<div className="flex h-full min-h-0">
					<ScrollArea className="bg-secondary min-w-20 md:w-1/5 shadow-inner">
						<SidebarNav
							items={[
								...settingsNavItems,
								{ title: 'Back', href: '/', icon: ResetIcon },
							]}
							className="py-2"
						/>
					</ScrollArea>
					<Separator orientation="vertical" />
					<ScrollArea className="flex-1" key={location}>
						<div className="px-4 py-4 pb-10">{children || <Outlet />}</div>
					</ScrollArea>
				</div>
			</div>
		</>
	);
}
