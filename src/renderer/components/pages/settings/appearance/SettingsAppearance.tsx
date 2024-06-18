import { Separator } from '@/components/ui/separator';
import { InputColor } from '@/renderer/components/input/InputColor';
import { ThemeForm } from '@/renderer/components/pages/settings/appearance/ThemeForm';
import { useGlobalContext } from '@/renderer/context/global-context';

export function SettingsAppearance() {
	const { settings, setSettings } = useGlobalContext();

	const handleChange = (e: string) => {
		setSettings({
			accentColor: e.substring(0, 7),
		});
	};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Appearance</h3>
				<p className="text-sm text-muted-foreground">
					Customize the appearance of the app. Switch between light and dark
					themes.
				</p>
			</div>
			<Separator />
			<InputColor
				value={settings.accentColor}
				label="Accent Color"
				details="Change the colors used to decorate the app."
				onChange={handleChange}
			/>
			<ThemeForm />
		</div>
	);
}
