import { CircleIcon, StarFilledIcon, StarIcon } from '@radix-ui/react-icons';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { useCallback, useEffect, useState } from 'react';

import { $errors, $settings } from '@/config/strings';

export function CardGithub() {
	const [githubData, setGithubData] = useState<any>(null);

	useEffect(() => {
		// fetch star count
		const fetchStarCount = async () => {
			const response = await fetch(
				`https://api.github.com/repos/${$settings.app.repo}`,
			);
			await response
				.json()
				.then((data: any) => {
					setGithubData(data);
				})
				.catch((error) => {
					window.electron.notify({
						title: $errors.github,
					});

					console.error(error);
				});
		};
		fetchStarCount();
	}, []);

	const handleClickStar = useCallback(() => {
		window?.electron?.openUrl($settings.app.githubUrl);
	}, []);

	return (
		<Card>
			<CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
				<div className="space-y-1">
					<CardTitle>
						{githubData?.full_name || githubData?.name || $settings.app.repo}
					</CardTitle>
					<CardDescription>
						{githubData?.description || $settings.app.description}
					</CardDescription>
				</div>
				<Button variant="secondary" onClick={handleClickStar}>
					<StarFilledIcon className="mr-2 h-4 w-4" />
					Star
				</Button>
			</CardHeader>
			<CardContent>
				<div className="flex space-x-4 text-sm text-muted-foreground">
					{githubData?.language && (
						<div className="flex items-center">
							<CircleIcon className="mr-1 h-3 w-3 fill-sky-400 text-sky-400" />
							{githubData?.language || 'Unknown'}
						</div>
					)}
					{githubData?.stargazers_count && (
						<div className="flex items-center">
							<StarIcon className="mr-1 h-3 w-3" />

							{githubData.stargazers_count}
						</div>
					)}
					{githubData?.updated_at && (
						<div>Updated {new Date(githubData.updated_at).toDateString()}</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
