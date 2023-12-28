import { ScrollArea } from '@/components/ui/scroll-area';
import React from 'react';

import { cn } from '@/lib/utils';
import styles from '@/renderer/styles/ScrollContainer.module.scss';

export function ScrollContainer({ children }: { children: React.ReactNode }) {
	return (
		<ScrollArea className={cn(styles.scrollContainer, 'h-full p-6')}>
			<div className="">{children}</div>
		</ScrollArea>
	);
}
