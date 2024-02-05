import { Separator } from '@/components/ui/separator';
import { SettingsType } from '@/config/settings';
import { useGlobalContext } from '@/renderer/context/global-context';
import { SettingSwitch } from '../../../../../components/input/SettingSwitch';

export function SettingsApplication() {
	const { settings } = useGlobalContext();

	const handleChangeSetting = (setting: Partial<SettingsType>) => {
		console.log('setting', setting);
		window.electron.setSettings(setting);
	};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Application</h3>
				<p className="text-sm text-muted-foreground">
					Select your application preferences.
				</p>
			</div>
			<Separator />
			<SettingSwitch
				value={settings.allowAnalytics}
				onChange={() => {
					handleChangeSetting({ allowAnalytics: !settings.allowAnalytics });
				}}
				label="Analytics"
				description="Help improve the app by sending anonymous usage data."
			/>
			<SettingSwitch
				value={settings.allowAutoUpdate}
				onChange={() => {
					handleChangeSetting({ allowAutoUpdate: !settings.allowAutoUpdate });
				}}
				label="Auto Update"
				description="Automatically download and install updates."
			/>
			<SettingSwitch
				value={settings.allowSounds}
				onChange={() => {
					handleChangeSetting({ allowSounds: !settings.allowSounds });
				}}
				label="Sounds"
				description="Play sounds for notifications and alerts."
			/>
			<SettingSwitch
				value={settings.allowNotifications}
				onChange={() => {
					handleChangeSetting({
						allowNotifications: !settings.allowNotifications,
					});
				}}
				label="Notifications"
				description="Show notifications for new messages and alerts."
			/>
			<SettingSwitch
				value={settings.showDockIcon}
				onChange={() => {
					handleChangeSetting({ showDockIcon: !settings.showDockIcon });
				}}
				label="Dock Icon"
				description="Show the app icon in the dock."
			/>
			<SettingSwitch
				value={settings.showTrayIcon}
				onChange={() => {
					handleChangeSetting({ showTrayIcon: !settings.showTrayIcon });
				}}
				label="Tray Icon"
				description="Show the app icon in the system tray."
			/>
			<SettingSwitch
				value={settings.quitOnWindowClose}
				onChange={() => {
					handleChangeSetting({
						quitOnWindowClose: !settings.quitOnWindowClose,
					});
				}}
				label="Quit on Window Close"
				description="Close the app when the window is closed."
			/>
		</div>
	);
}
