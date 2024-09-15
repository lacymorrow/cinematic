// https://github.com/shadcn-ui/ui/tree/main/apps/www/app/examples/forms

import { BellIcon, CardStackIcon, DesktopIcon } from '@radix-ui/react-icons';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { NotificationType } from '@/config/settings';
import { cn } from '@/lib/utils';
import { useGlobalContext } from '@/renderer/context/global-context';
import { BellOffIcon } from 'lucide-react';

export function CardNotifications() {
	const { settings, setSettings } = useGlobalContext();

	const handleChange = (e: NotificationType | 'none') => {
		setSettings({
			allowNotifications: e !== 'none',
			...(e !== 'none' ? { notificationType: e } : {}),
		});
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle>Notification Style</CardTitle>
				<CardDescription>
					Choose where you receive notifications.
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-1">
				<button
					onClick={() => handleChange('all')}
					type="button"
					className={cn(
						'-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all',
						settings.allowNotifications &&
							settings.notificationType === 'all' &&
							'bg-accent hover:text-accent-foreground',
					)}
				>
					<BellIcon className="mt-px h-5 w-5" />
					<div className="space-y-1">
						<p className="text-sm font-medium leading-none text-left">
							Everywhere
						</p>
						<p className="text-sm text-muted-foreground">
							Notify me with system and app notifications.
						</p>
					</div>
				</button>
				<button
					onClick={() => handleChange('system')}
					type="button"
					className={cn(
						'-mx-2 flex items-start space-x-4 rounded-md p-2 text-accent-foreground transition-all',
						settings.allowNotifications &&
							settings.notificationType === 'system' &&
							'bg-accent hover:text-accent-foreground',
					)}
				>
					<DesktopIcon className="mt-px h-5 w-5" />
					<div className="space-y-1">
						<p className="text-sm font-medium leading-none text-left">
							System notifications
						</p>
						<p className="text-sm text-muted-foreground">
							Use the system default notifications.
						</p>
					</div>
				</button>
				<button
					onClick={() => handleChange('app')}
					type="button"
					className={cn(
						'-mx-2 flex items-start space-x-4 rounded-md p-2 text-accent-foreground transition-all',
						settings.allowNotifications &&
							settings.notificationType === 'app' &&
							'bg-accent hover:text-accent-foreground',
					)}
				>
					<CardStackIcon className="mt-px h-5 w-5" />
					<div className="space-y-1">
						<p className="text-sm font-medium leading-none text-left">
							App-only
						</p>
						<p className="text-sm text-muted-foreground">
							Only notify me within the app.
						</p>
					</div>
				</button>
				<button
					onClick={() => handleChange('none')}
					type="button"
					className={cn(
						'-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all',
						!settings.allowNotifications &&
							'bg-accent hover:text-accent-foreground',
					)}
				>
					<BellOffIcon className="mt-px h-5 w-5" />
					<div className="space-y-1">
						<p className="text-sm font-medium leading-none text-left">
							Ignoring
						</p>
						<p className="text-sm text-muted-foreground">
							Turn off all notifications.
						</p>
					</div>
				</button>
			</CardContent>
		</Card>
	);
}
