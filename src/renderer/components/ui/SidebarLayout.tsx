import React from 'react';
import { Sidebar } from './Sidebar';

export function SidebarLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Sidebar className="w-60" />
			<div className="grow lg:border-l basis-full min-w-0">{children}</div>
		</>
	);
}
