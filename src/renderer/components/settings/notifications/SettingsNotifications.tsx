import { Separator } from '@/components/ui/separator';
import { CardNotifications } from './CardNotifications';
import { NotificationsForm } from './NotificationsForm';

export default function SettingsNotifications() {
	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Notifications</h3>
				<p className="text-sm text-muted-foreground">
					Configure how you receive notifications.
				</p>
			</div>
			<Separator />
			<CardNotifications />
			<Separator />
			<NotificationsForm />
		</div>
	);
}
