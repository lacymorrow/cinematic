'use client';

import { LucideIcon } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export interface NavLinkProps {
	title: string;
	label?: string | JSX.Element;
	icon: LucideIcon | React.FC;
	variant?: 'default' | 'ghost' | 'secondary';
	href?: string;
}

interface NavProps {
	isCollapsed: boolean;
	links: NavLinkProps[];
}

export function Nav({ links, isCollapsed }: NavProps) {
	return (
		<div
			data-collapsed={isCollapsed}
			className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
		>
			<nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
				{links.map((link, index) =>
					isCollapsed ? (
						<Tooltip key={index} delayDuration={0}>
							<TooltipTrigger asChild>
								<Link
									to={link.href || '#'}
									className={cn(
										buttonVariants({
											variant: link.variant ? link.variant : 'ghost',
											size: 'icon',
										}),
										'h-9 w-9',
										link.variant === 'default' &&
											'dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white',
									)}
								>
									<link.icon className="h-4 w-4" />
									<span className="sr-only">{link.title}</span>
								</Link>
							</TooltipTrigger>
							<TooltipContent side="right" className="flex items-center gap-4">
								{link.title}
								{link.label && (
									<span className="ml-auto text-muted-foreground">
										{link.label}
									</span>
								)}
							</TooltipContent>
						</Tooltip>
					) : (
						<Link
							key={index}
							to={link.href || '#'}
							className={cn(
								buttonVariants({
									variant: link.variant ? link.variant : 'ghost',
									size: 'sm',
								}),
								// This is the currently selected link
								link.variant === 'default' &&
									'dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white',
								'justify-start min-w-0 group overflow-hidden', // group for the delete playlist button
							)}
						>
							<link.icon className="mr-2 h-4 w-4 shrink-0" />
							<span className="text-ellipsis whitespace-nowrap overflow-hidden">
								{link.title}
							</span>
							{link.label && (
								<span
									className={cn(
										'pl-2 ml-auto text-muted-foreground',
										link.variant === 'default' &&
											'text-background dark:text-white',
									)}
								>
									{link.label}
								</span>
							)}
						</Link>
					),
				)}
			</nav>
		</div>
	);
}
