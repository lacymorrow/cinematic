import { cn } from '@/lib/utils';
import { RATINGS_ROTATOR_INTERVAL, ROTATOR_TRANSITION_DURATION } from '@/renderer/config/config';
import { StarIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

export interface Rating {
    name: string;
    score: number;
    votes?: number;
}

const starClasses = "fill-muted stroke-muted-foreground size-6 opacity-50";

const RatingsRotator: React.FC<{ ratings: Rating[] }> = ({ ratings }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [fade, setFade] = useState(false);

    useEffect(() => {
        if (!ratings || ratings.length === 0) return;

        const interval = setInterval(() => {
            setFade(true);
            setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % ratings.length);
                setFade(false);
            }, ROTATOR_TRANSITION_DURATION); // Duration of fade-out animation
        }, RATINGS_ROTATOR_INTERVAL); // Time before rotating to next rating

        return () => clearInterval(interval);
    }, [ratings]);

    if (!ratings || ratings.length === 0) return null;

    const currentRating = ratings[currentIndex];

    // Additional null check for currentRating
    if (!currentRating) {
        console.warn(`RatingsRotator: currentRating at index ${currentIndex} is null or undefined.`);
        return null;
    }

    // Define maxScore based on the rating source
    const maxScore = currentRating.name === 'Metascore' ? 100 : 10;

    // Ensure maxScore is not zero to prevent division by zero
    const sanitizedMaxScore = maxScore > 0 ? maxScore : 10;

    const starCount = Math.round((currentRating.score / sanitizedMaxScore) * 5 * 2) / 2; // Half-star precision

    const getStarIcons = (count: number) => {
        const fullStars = Math.floor(count);
        const halfStar = count % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        const stars = [];
        for (let i = 0; i < fullStars; i++) {
            stars.push(<StarIcon key={`full-${i}`} className={starClasses} />);
        }

        if (halfStar) {
            stars.push(
                <div key="half" className="relative size-6">
                    <StarIcon
                        className={cn("size-6", starClasses)}
                        style={{
                            overflow: 'hidden',
                            clipPath: 'inset(0 50% 0 0)',
                            WebkitClipPath: 'inset(0 50% 0 0)',
                        }}
                    />
                </div>
            );
        }

        // for (let i = 0; i < emptyStars; i++) {
        //     stars.push(<StarIcon key={`empty-${i}`} className="text-gray-300 w-5 h-5" />);
        // }

        return stars;
    };

    const variants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -5 },
    };

    return (
        <div className="flex flex-col justify-center items-center min-w-40">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentRating.name}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center gap-2"
                >
                    <div className="flex gap-2">
                        {getStarIcons(starCount)}
                    </div>
                    <p className="flex items-center justify-center gap-2">
                        <span className="text-muted-foreground text-sm opacity-50">{currentRating.name}</span>
                        {currentRating.votes && <span className="text-muted-foreground text-xs opacity-50">({currentRating.votes} votes)</span>}
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default RatingsRotator;