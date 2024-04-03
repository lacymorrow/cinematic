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
	const currentPage =
		items.find((item) => pathname.endsWith(item.href)) || items[0];

	return (
		<nav
			className={cn(
				'flex flex-wrap flex-col items-start justify-stretch',
				className,
			)}
			{...props}
		>
			{items.map((item) => {
				return (
					<Link
						draggable={false}
						key={item.href}
						to={item.href}
						className={cn(
							buttonVariants({
								variant: currentPage.href === item.href ? 'default' : 'ghost',
							}),
							currentPage.href === item.href ? 'font-bold' : 'font-normal',
							'justify-start w-full flex gap-2 rounded-none py-6',
						)}
					>
						{item.icon && <item.icon />}
						{item.title}
					</Link>
				);
			})}
		</nav>
	);
}
