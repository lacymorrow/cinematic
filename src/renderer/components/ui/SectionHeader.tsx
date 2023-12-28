import React from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

// </div>
export function SectionHeader({
	title,
	tagline,
	children,
	className,
}: {
	title: string;
	tagline?: string;
	children?: React.ReactNode;
	className?: string;
}) {
	return (
		<>
			<div className={cn('flex items-start justify-between', className)}>
				<div className="space-y-1">
					<h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
					{tagline && (
						<p className="text-sm text-muted-foreground">{tagline}</p>
					)}
				</div>
				{children && (
					<div className="flex items-center space-x-4">{children}</div>
				)}
			</div>
			<Separator className="my-4" />
		</>
	);
}
