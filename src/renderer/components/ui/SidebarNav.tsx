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
			className={cn(
				'flex flex-wrap gap-2 md:flex-col items-start justify-stretch',
				className,
			)}
			{...props}
		>
			{items.map((item) => (
				<Link
					key={item.href}
					to={item.href}
					className={cn(
						buttonVariants({
							variant: pathname.endsWith(item.href) ? 'secondary' : 'ghost',
						}),
						'justify-start md:w-full flex gap-2',
					)}
				>
					{item.icon && <item.icon />}
					{item.title}
				</Link>
			))}
		</nav>
	);
}
