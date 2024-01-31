import { Separator } from '@/components/ui/separator';
import { $settings } from '@/config/strings';
import { SidebarNav } from '@/renderer/components/ui/SidebarNav';
import { settingsNavItems } from '@/renderer/config/nav';
import React from 'react';
import { Outlet } from 'react-router-dom';

interface SettingsLayoutProps {
	children?: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
	return (
		<>
			<div className="space-y-6 p-10 pb-16">
				<div className="space-y-0.5">
					<h2 className="text-2xl font-bold tracking-tight">
						{$settings.title}
					</h2>
					<p className="text-muted-foreground">{$settings.description}</p>
				</div>
				<Separator className="my-6" />
				<div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
					<aside className="-mx-4 lg:w-1/5">
						<SidebarNav
							items={[...settingsNavItems, { title: '↩ Back', href: '/' }]}
						/>
					</aside>
					<div className="flex-1 lg:max-w-2xl">{children || <Outlet />}</div>
				</div>
			</div>
		</>
	);
}
