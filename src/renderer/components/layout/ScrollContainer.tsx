import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ScrollContainer({ children }: { children: React.ReactNode }) {
	return <ScrollArea className="h-full p-6">{children}</ScrollArea>;
}
