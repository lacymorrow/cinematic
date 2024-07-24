import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { GlobalContextProvider } from '@/renderer/context/global-context';
import { ThemeProvider } from '@/renderer/context/theme-context';

import React from 'react';

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<React.StrictMode>
			<GlobalContextProvider>
				<ThemeProvider>
					<TooltipProvider delayDuration={0}>
						{children}
					</TooltipProvider>
					<Toaster />
				</ThemeProvider>
			</GlobalContextProvider>
		</React.StrictMode>
	);
}
