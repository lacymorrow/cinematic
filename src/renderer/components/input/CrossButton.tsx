import { cn } from '@/lib/utils';
import { CrossCircledIcon } from '@radix-ui/react-icons';
import React from 'react';

export function CrossButton({
	onClick,
	className,
	...props
}: {
	onClick: () => void;
	className?: string;
	style?: React.CSSProperties;
	props?: any;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				'text-primary hover:text-muted-foreground absolute z-10 top-0 bottom-0 right-0 px-4 py-2 grid place-content-center',
				className,
			)}
			{...props}
		>
			<CrossCircledIcon className="w-4 h-4" />
			<span className="sr-only">Clear value...</span>
		</button>
	);
}
