'use client';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
	items: {
		href: string;
		title: string;
		icon?: React.ElementType;
	}[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
	const { pathname } = useLocation();

	return (
		<nav
			className={cn('flex flex-wrap gap-2 lg:flex-col items-start', className)}
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
						'justify-start flex gap-2',
					)}
				>
					{item.icon && <item.icon />}
					{item.title}
				</Link>
			))}
		</nav>
	);
}
