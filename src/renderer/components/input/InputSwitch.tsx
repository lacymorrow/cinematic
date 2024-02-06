import { Switch } from '@/components/ui/switch';
import { simpleUUID } from '@/utils/getUUID';
import { useMemo, useState } from 'react';

export function InputSwitch({
	value,
	onChange,
	label,
	description,
	details,
	...props
}: {
	value?: boolean;
	onChange?: (value: boolean) => void;
	label?: string;
	description?: string;
	details?: string;
	props?: any;
}) {
	const uuid = useMemo(simpleUUID, []);

	return (
		<div className="flex flex-row items-center justify-between rounded-lg border p-4">
			<div className="space-y-0.5">
				{label && (
					<label htmlFor={uuid} className="font-medium text-base">
						{label}
					</label>
				)}
				{description && <p>{description}</p>}
			</div>
			<Switch
				id={uuid}
				checked={value}
				{...(onChange ? { onCheckedChange: onChange } : {})}
				{...props}
			/>
			{details && <p className="text-xs text-muted-foreground">{details}</p>}
		</div>
	);
}
