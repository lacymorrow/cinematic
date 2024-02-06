import { Separator } from '@/components/ui/separator';
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
			<ThemeForm />
		</div>
	);
}
