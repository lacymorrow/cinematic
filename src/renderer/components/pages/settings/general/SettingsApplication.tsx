import { Separator } from '@/components/ui/separator';
import { SettingsType } from '@/config/settings';
import { useGlobalContext } from '@/renderer/context/global-context';
import { InputSwitch } from '@/renderer/components/input/InputSwitch';
import { InputSlider } from '@/renderer/components/input/InputSlider';
import { InputMouseKeyboardBind } from '@/renderer/components/input/InputMouseKeyboardBind';
import { InputKeyboardShortcut } from '@/renderer/components/input/InputKeyboardShortcut';
import { InputColor } from '@/renderer/components/input/InputColor';
import { THROTTLE_DELAY } from '@/config/config';

export function SettingsApplication() {
	const { app, settings } = useGlobalContext();

	const handleChangeSetting = (setting: Partial<SettingsType>) => {
		console.log('setting', setting);
		window.electron.setSettings(setting);
	};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Application Settings</h3>
				<p className="text-sm text-muted-foreground">
					Select your application preferences.
				</p>
			</div>
			<Separator />
			<InputSlider
				value={2}
				onChange={(value) => {
					console.log('value', value);
				}}
				label="Zoom Factor"
				description="Adjust the zoom level of the app."
				min={0.5}
				max={3}
				step={0.1}
				throttleDelay={THROTTLE_DELAY}
			/>
			<InputSwitch
				value={settings.allowAutoUpdate}
				onChange={() => {
					handleChangeSetting({ allowAutoUpdate: !settings.allowAutoUpdate });
				}}
				label="Auto Update"
				description="Automatically download and install new updates."
				card
			/>
			{(app.isMac || app.isDev) && (
				<InputSwitch
					value={settings.showDockIcon}
					onChange={() => {
						handleChangeSetting({ showDockIcon: !settings.showDockIcon });
					}}
					label="Dock Icon"
					description="Show the app icon in the dock."
					card
				/>
			)}
			<InputSwitch
				value={settings.showTrayIcon}
				onChange={() => {
					handleChangeSetting({ showTrayIcon: !settings.showTrayIcon });
				}}
				label="Tray Icon"
				description="Show the app icon in the system tray."
				card
			/>
			{(app.isMac || app.isDev) && (
				<InputSwitch
					value={settings.quitOnWindowClose}
					onChange={() => {
						handleChangeSetting({
							quitOnWindowClose: !settings.quitOnWindowClose,
						});
					}}
					label="Quit when all windows Close"
					description="Don't keep the app running when all windows are closed."
					card
				/>
			)}
			<Separator />
			<InputSwitch
				value={settings.allowAnalytics}
				onChange={() => {
					handleChangeSetting({ allowAnalytics: !settings.allowAnalytics });
				}}
				label="Enable Telemetry"
				description="Help improve the app by sending anonymous usage data."
			/>
		</div>
	);
}
