import { Separator } from '@/components/ui/separator';
import { CardNotifications } from './CardNotifications';

export function SettingsNotifications() {
	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Notifications</h3>
				<p className="text-sm text-muted-foreground">
					Configure your notification preferences.
				</p>
			</div>
			<Separator />
			<CardNotifications />
		</div>
	);
}
