import { Separator } from '@/components/ui/separator';
import { InputColor } from '@/renderer/components/input/InputColor';
import { ThemeForm } from './ThemeForm';

export function SettingsAppearance() {
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
				value="#b453ff"
				label="Accent Color"
				details="Change the colors used to decorate the app."
				onChange={(value) => {
					console.log('value', value);
				}}
			/>
			<ThemeForm />
		</div>
	);
}
