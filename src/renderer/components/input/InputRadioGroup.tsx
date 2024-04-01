import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { simpleUUID } from '@/utils/getUUID';
import React, { useCallback, useMemo } from 'react';

export function InputRadioGroup({
	items,
	value,
	onChange,
	label,
	description,
	details,
	content,
	card,
	...props
}: {
	items: { value: string; label: string }[];
	value?: string;
	onChange?: (value: string) => void;
	label?: string;
	description?: string;
	details?: string;
	content?: React.ReactNode;
	card?: boolean;
	props?: any;
}) {
	const uuid = useMemo(simpleUUID, []);

	const handleChange = useCallback(
		(result: string) => {
			onChange?.(result);
		},
		[onChange],
	);

	return (
		<div className={cn('flex flex-col gap-4', card && 'rounded-lg border p-4')}>
			<div className="flex flex-col gap-2">
				<div className="space-y-0.5">
					{label && (
						<label htmlFor={uuid} className="font-medium text-base">
							{label}
						</label>
					)}
					{description && (
						<p className="text-muted-foreground">{description}</p>
					)}
				</div>
				<RadioGroup
					defaultValue={value}
					onValueChange={handleChange}
					{...props}
				>
					{items.map((option) => (
						<div key={option.value} className="flex items-center space-x-2">
							<RadioGroupItem value={option.value} id={uuid} />
							<Label htmlFor={uuid}>{option.label}</Label>
						</div>
					))}
				</RadioGroup>
			</div>
			{details && <p className="text-sm text-muted-foreground">{details}</p>}
			{content && <div>{content}</div>}
		</div>
	);
}
