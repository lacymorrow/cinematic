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
				'flex flex-wrap flex-col items-start justify-stretch',
				className,
			)}
			{...props}
		>
			{items.map((item) => {
				const isCurrentPage = pathname.endsWith(item.href);
				return (
					<Link
						draggable={false}
						key={item.href}
						to={item.href}
						className={cn(
							buttonVariants({
								variant: isCurrentPage ? 'default' : 'ghost',
							}),
							isCurrentPage ? 'font-bold' : 'font-normal',
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
