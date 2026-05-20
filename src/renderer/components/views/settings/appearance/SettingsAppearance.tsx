import { Separator } from '@/components/ui/separator';
import { ThumbnailSizeType } from '@/config/settings';
import { InputColor } from '@/renderer/components/input/InputColor';
import { ThemeForm } from '@/renderer/components/views/settings/appearance/ThemeForm';
import { useGlobalContext } from '@/renderer/context/global-context';

const THUMBNAIL_SIZE_OPTIONS: {
	value: ThumbnailSizeType;
	label: string;
	description: string;
}[] = [
	{ value: 'small', label: 'Small', description: '150px' },
	{ value: 'medium', label: 'Medium', description: '200px' },
	{ value: 'large', label: 'Large', description: '250px' },
];

export function SettingsAppearance() {
	const { settings, setSettings } = useGlobalContext();

	const handleChange = (e: string) => {
		setSettings({
			accentColor: e.substring(0, 7),
		});
	};

	const handleThumbnailSizeChange = (size: ThumbnailSizeType) => {
		setSettings({ thumbnailSize: size });
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
			<div className="space-y-2">
				<div>
					<p className="text-sm font-medium leading-none">Poster Size</p>
					<p className="text-sm text-muted-foreground mt-1">
						Choose the size of movie posters in the library grid.
					</p>
				</div>
				<div className="flex gap-3 pt-1">
					{THUMBNAIL_SIZE_OPTIONS.map(({ value, label, description }) => (
						<button
							key={value}
							type="button"
							onClick={() => handleThumbnailSizeChange(value)}
							className={`flex flex-col items-center gap-1 rounded-md border-2 p-3 text-sm transition-colors ${
								settings.thumbnailSize === value
									? 'border-primary bg-primary/5'
									: 'border-muted hover:border-muted-foreground'
							}`}
						>
							<span className="font-medium">{label}</span>
							<span className="text-xs text-muted-foreground">
								{description}
							</span>
						</button>
					))}
				</div>
			</div>
			<ThemeForm />
		</div>
	);
}
