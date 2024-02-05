import { Switch } from '@/components/ui/switch';

export function SettingSwitch({
	value,
	onChange,
	label,
	description,
}: {
	value: boolean;
	onChange: (value: boolean) => void;
	label: string;
	description: string;
}) {
	const uuid = crypto.randomUUID();
	return (
		<div className="flex flex-row items-center justify-between rounded-lg border p-4">
			<div className="space-y-0.5">
				<label htmlFor={uuid} className="text-base">
					{label}
				</label>
				<p>{description}</p>
			</div>
			<Switch name={uuid} checked={value} onCheckedChange={onChange} />
		</div>
	);
}
