import { Separator } from '@/components/ui/separator';
import { $settings } from '@/config/strings';
import { SidebarNav } from '@/renderer/components/ui/SidebarNav';
import { settingsNavItems } from '@/renderer/config/nav';
import { ResetIcon } from '@radix-ui/react-icons';
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
				<div className="flex flex-col space-y-8 md:flex-row md:space-x-12 md:space-y-0">
					<aside className="-mx-4 md:w-1/5">
						<SidebarNav
							items={[
								...settingsNavItems,
								{ title: 'Back', href: '/', icon: ResetIcon },
							]}
						/>
					</aside>
					<div className="flex-1 md:max-w-2xl">{children || <Outlet />}</div>
				</div>
			</div>
		</>
	);
}
