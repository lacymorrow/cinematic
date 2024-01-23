import { Toaster } from '@/components/ui/sonner';
import { GlobalContextProvider } from '@/renderer/context/global-context';
import { ThemeProvider } from '@/renderer/context/theme-context';

import React from 'react';

// We can't use the ScrollArea here or the scroll will persist between navigations
export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<GlobalContextProvider>
			<ThemeProvider>
				{children}
				<Toaster />
			</ThemeProvider>
		</GlobalContextProvider>
	);
}
