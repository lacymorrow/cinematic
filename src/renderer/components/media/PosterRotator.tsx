import { $actions } from '@/config/strings';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function PosterRotator({
	images,
	className,
	...props
}: {
	images: string[];
	className?: string;
}) {
	const [index, setIndex] = useState(0);

	const handleClick = () => {
		setIndex((index + 1) % images.length);
	};

	return (
		<button
			title={$actions.rotatePoster}
			type="button"
			className={cn('h-[375px] aspect-[3/4.5] group', className)}
			onClick={handleClick}
		>
			<img
				draggable={false}
				src={images[index]}
				alt=""
				className={cn(
					'h-auto w-auto object-cover transition-all group-hover:scale-105',
				)}
			/>
			<span className="sr-only">{$actions.rotatePoster}</span>
		</button>
	);
}
