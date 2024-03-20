import { CircleIcon, StarIcon } from '@radix-ui/react-icons';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { useCallback } from 'react';

import { $settings } from '@/config/strings';

export function CardGithub() {
	const handleClickStar = useCallback(() => {
		window?.electron?.openUrl($settings.app.githubUrl);
	}, []);

	return (
		<Card>
			<CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
				<div className="space-y-1">
					<CardTitle>Electron-Hotplate</CardTitle>
					<CardDescription>
						Beautifully designed organization for your digital media collection.
					</CardDescription>
				</div>
				<Button variant="secondary" onClick={handleClickStar}>
					<StarIcon className="mr-2 h-4 w-4" />
					Star
				</Button>
			</CardHeader>
			<CardContent>
				<div className="flex space-x-4 text-sm text-muted-foreground">
					<div className="flex items-center">
						<CircleIcon className="mr-1 h-3 w-3 fill-sky-400 text-sky-400" />
						TypeScript
					</div>
					<div className="flex items-center">
						<StarIcon className="mr-1 h-3 w-3" />
						33
					</div>
					<div>Updated December 2024</div>
				</div>
			</CardContent>
		</Card>
	);
}
