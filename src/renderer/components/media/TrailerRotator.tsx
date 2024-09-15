import { cn } from '@/lib/utils';
import { ROTATOR_TRANSITION_DURATION } from '@/renderer/config/config';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';

interface TrailerRotatorProps {
    videoIds: string[];
    transitionDuration?: number; // Duration of the transition animation in seconds
}

const TrailerRotator: React.FC<TrailerRotatorProps> = ({
    videoIds,
    transitionDuration = ROTATOR_TRANSITION_DURATION, // Default to 0.5 seconds
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + videoIds.length) % videoIds.length);
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % videoIds.length);
    };

    if (!videoIds || videoIds.length === 0) return null;

    const currentVideoId = videoIds[currentIndex];

    const variants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };

    return (<div className='relative flex flex-col items-stretch justify-center'>
        <div className='relative flex items-center justify-stretch gap-4'>
            {videoIds.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className="bg-primary-foreground bg-opacity-50 hover:bg-opacity-75 text-primary rounded-full p-2 focus:outline-none"
                        aria-label="Previous Trailer"
                    >
                        <ChevronLeftIcon className="w-4 h-4" />
                    </button>

                </>
            )}
            <div className="relative aspect-video h-full grow"> {/* Changed h-full to h-80 */}
                <AnimatePresence mode="wait">
                    <motion.iframe
                        key={currentVideoId}
                        src={`https://www.youtube.com/embed/${currentVideoId}?controls=1&autoplay=1&mute=1`}
                        title={`Trailer ${currentIndex + 1}`}
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        className={cn(
                            'absolute top-0 left-0 w-full h-full rounded-lg shadow-lg',
                            'object-cover'
                        )}
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: transitionDuration }}
                    />
                </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            {videoIds.length > 1 && (
                <>

                    <button
                        onClick={handleNext}
                        className="bg-primary-foreground bg-opacity-50 hover:bg-opacity-75 text-primary rounded-full p-2 focus:outline-none"
                        aria-label="Next Trailer"
                    >
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </>
            )}
        </div>

        <div className="flex justify-center mt-4 space-x-4">
            {videoIds.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                        'w-3 h-3 p-1 rounded-full',
                        index === currentIndex ? 'bg-muted-foreground' : 'bg-muted'
                    )}
                    aria-label={`Go to trailer ${index + 1}`}
                />
            ))}
        </div>
    </div>
    );
};

export default TrailerRotator;