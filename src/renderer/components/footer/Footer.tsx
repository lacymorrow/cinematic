import React from 'react';

// We can't use the ScrollArea here or the scroll will persist between navigations
export function Footer({ children }: { children: React.ReactNode }) {
	return (
		<div className="z-10 w-full h-6 flex shrink-0 border-t bg-background text-[11px] items-center px-2 py-1 justify-between text-muted-foreground select-none">
			{children}
		</div>
	);
}
