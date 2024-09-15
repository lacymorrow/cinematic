import { $actions } from '@/config/strings';
import { cn } from '@/lib/utils';
import { POSTER_ROTATOR_INTERVAL } from '@/renderer/config/config';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface PosterRotatorProps {
	images: string[];
	className?: string;
	interval?: number; // Time before rotating to next image in milliseconds
}

export function PosterRotator({
	images,
	className,
	interval = POSTER_ROTATOR_INTERVAL, // Default to 5 seconds
}: PosterRotatorProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isHovered, setIsHovered] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const clearTimeoutRef = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
	};

	useEffect(() => {
		if (isHovered) {
			clearTimeoutRef();
			return;
		}

		timeoutRef.current = setTimeout(() => {
			setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
		}, interval);

		return () => {
			clearTimeoutRef();
		};
	}, [currentIndex, isHovered, images.length, interval]);

	const handleRotate = () => {
		setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
	};

	const variants = {
		initial: { opacity: 0, y: 10 },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: -10 },
	};

	return (
		<button
			title={$actions.rotatePoster}
			type="button"
			className={cn('relative h-[375px] aspect-[3/4.5] group overflow-hidden hover:scale-105 transition-all duration-200 hover:brightness-50', className)}
			onClick={handleRotate}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<AnimatePresence>
				<motion.img
					key={images[currentIndex]}
					src={images[currentIndex]}
					alt={`Poster ${currentIndex + 1}`}
					className="absolute top-0 left-0 w-full h-full object-cover rounded-lg shadow-lg"
					initial="initial"
					animate="animate"
					exit="exit"
					variants={variants}
					transition={{ duration: 0.5 }}
				/>
			</AnimatePresence>
			<span className="sr-only">{$actions.rotatePoster}</span>
		</button>
	);
}
