import { SettingsAppearance } from '../appearance/SettingsAppearance';
import { SettingsApplication } from './SettingsApplication';

export function SettingsGeneral() {
	return (
		<div className="space-y-10">
			<SettingsApplication />
			<SettingsAppearance />
		</div>
	);
}
