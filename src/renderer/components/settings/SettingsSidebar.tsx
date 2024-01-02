import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SettingsSidebarProps extends React.HTMLAttributes<HTMLElement> {
	items: {
		href: string;
		title: string;
	}[];
}

export function SettingsSidebar({
	className,
	items,
	...props
}: SettingsSidebarProps) {
	const { pathname } = useLocation();
	console.log('pathname', pathname);
	return (
		<nav
			className={cn(
				'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1',
				className,
			)}
			{...props}
		>
			{items.map((item) => (
				<Link
					to={item.href}
					key={item.href}
					className={cn(
						buttonVariants({ variant: 'ghost' }),
						pathname === item.href
							? 'bg-muted hover:bg-muted'
							: 'hover:bg-transparent hover:underline',
						'justify-start',
					)}
				>
					{item.title}
				</Link>
			))}
		</nav>
	);
}
