import { Separator } from '@/components/ui/separator';
import { SettingsType } from '@/config/settings';
import { useGlobalContext } from '@/renderer/context/global-context';
import { InputSwitch } from '@/renderer/components/input/InputSwitch';
import { InputSlider } from '@/renderer/components/input/InputSlider';
import { InputMouseKeyboardBind } from '@/renderer/components/input/InputMouseKeyboardBind';
import { InputKeyboardShortcut } from '@/renderer/components/input/InputKeyboardShortcut';
import { InputColor } from '@/renderer/components/input/InputColor';

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
			<InputColor
				value="#000000"
				label="Accent Color"
				description="Customize the accent color for the app."
				onChange={(value) => {
					console.log('value', value);
				}}
			/>
			<InputKeyboardShortcut
				value="asd"
				label="Keyboard Shortcut"
				description="Set a keyboard shortcut to open the app."
				onChange={(value) => {
					console.log('value', value);
				}}
			/>
			<InputMouseKeyboardBind
				label="Keyboard Shortcut"
				description="Set a keyboard shortcut to open the app."
				onChange={(value) => {
					console.log('value', value);
				}}
			/>
			<InputSlider
				label="Zoom Factor"
				description="Adjust the zoom factor for the app."
				min={0.5}
				max={3}
				step={0.1}
				throttleDelay={500}
			/>
			<InputSwitch
				value={settings.allowAnalytics}
				onChange={() => {
					handleChangeSetting({ allowAnalytics: !settings.allowAnalytics });
				}}
				label="Analytics"
				description="Help improve the app by sending anonymous usage data."
			/>
			<InputSwitch
				value={settings.allowAutoUpdate}
				onChange={() => {
					handleChangeSetting({ allowAutoUpdate: !settings.allowAutoUpdate });
				}}
				label="Auto Update"
				description="Automatically download and install updates."
			/>
			<InputSwitch
				value={settings.allowSounds}
				onChange={() => {
					handleChangeSetting({ allowSounds: !settings.allowSounds });
				}}
				label="Sounds"
				description="Play sounds for notifications and alerts."
			/>
			<InputSwitch
				value={settings.allowNotifications}
				onChange={() => {
					handleChangeSetting({
						allowNotifications: !settings.allowNotifications,
					});
				}}
				label="Notifications"
				description="Show notifications for new messages and alerts."
			/>
			<InputSwitch
				value={settings.showDockIcon}
				onChange={() => {
					handleChangeSetting({ showDockIcon: !settings.showDockIcon });
				}}
				label="Dock Icon"
				description="Show the app icon in the dock."
			/>
			<InputSwitch
				value={settings.showTrayIcon}
				onChange={() => {
					handleChangeSetting({ showTrayIcon: !settings.showTrayIcon });
				}}
				label="Tray Icon"
				description="Show the app icon in the system tray."
			/>
			<InputSwitch
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
