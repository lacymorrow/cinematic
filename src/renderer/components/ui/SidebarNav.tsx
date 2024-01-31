'use client';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
	items: {
		href: string;
		title: string;
	}[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
	const { pathname } = useLocation();

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
					key={item.href}
					to={item.href}
					className={cn(
						buttonVariants({ variant: 'ghost' }),
						pathname.endsWith(item.href)
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
