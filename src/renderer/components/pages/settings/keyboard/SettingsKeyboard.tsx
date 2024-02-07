import { Separator } from '@/components/ui/separator';
import { SettingsType } from '@/config/settings';
import { useGlobalContext } from '@/renderer/context/global-context';
import { InputSwitch } from '@/renderer/components/input/InputSwitch';
import { InputSlider } from '@/renderer/components/input/InputSlider';
import { InputMouseKeyboardBind } from '@/renderer/components/input/InputMouseKeyboardBind';
import { InputKeyboardShortcut } from '@/renderer/components/input/InputKeyboardShortcut';
import { InputColor } from '@/renderer/components/input/InputColor';
import { CustomAcceleratorsType } from '@/types/keyboard';

export function SettingsKeyboard() {
	const { keybinds } = useGlobalContext();

	const handleChangeKeybind = (
		key: keyof CustomAcceleratorsType,
		value: string,
	) => {
		window.electron.setKeybind(key, value);
	};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Keyboard Shortcuts</h3>
				<p className="text-sm text-muted-foreground">
					Customize keyboard shortcuts to control the application. Press
					&quot;Backspace&quot; or &quot;Delete&quot; to clear the current
					shortcut.
				</p>
			</div>
			<Separator />
			<InputKeyboardShortcut
				value={keybinds.reset}
				label="Reset Application Settings"
				description="Clear all settings and restore the app to its default state."
				onChange={(value) => {
					handleChangeKeybind('reset', value);
				}}
			/>
		</div>
	);
}
