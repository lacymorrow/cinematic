import { ScrollArea } from '@/components/ui/scroll-area';
import React from 'react';

export function ScrollContainer({ children }: { children: React.ReactNode }) {
	return (
		<ScrollArea className="h-full">
			<div className="">{children}</div>
		</ScrollArea>
	);
}
