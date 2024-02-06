import { Separator } from '@/components/ui/separator';
import { InputSwitch } from '@/renderer/components/input/InputSwitch';
import { useGlobalContext } from '@/renderer/context/global-context';
import { SettingsType } from '@/config/settings';
import { Button } from '@/components/ui/button';
import { CardNotifications } from '@/renderer/components/pages/settings/notifications/CardNotifications';

export function SettingsNotifications() {
	const { settings } = useGlobalContext();

	const handleChangeSetting = (setting: Partial<SettingsType>) => {
		console.log('setting', setting);
		window.electron.setSettings(setting);
	};
	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Notifications</h3>
				<p className="text-sm text-muted-foreground">
					Configure your notification preferences.
				</p>
			</div>
			<Separator />
			<InputSwitch
				value={settings.allowSounds}
				onChange={() => {
					handleChangeSetting({ allowSounds: !settings.allowSounds });
				}}
				label="Play Sounds"
				description="Play sounds for notifications and alerts."
				content={
					<Button
						onClick={() => {
							window.electron.playSound('NOTIFICATION');
						}}
					>
						Play a test sound
					</Button>
				}
				card
			/>

			<InputSwitch
				value={settings.allowNotifications}
				onChange={() => {
					handleChangeSetting({
						allowNotifications: !settings.allowNotifications,
					});
				}}
				label="Allow Notifications"
				description="Show pop-up text notifications."
				content={
					<Button
						onClick={() => {
							window.electron.notify({
								title: 'Test Notification',
								body: 'This is a test notification',
							});
						}}
					>
						Send a test notification
					</Button>
				}
				card
			/>

			<CardNotifications />
		</div>
	);
}
