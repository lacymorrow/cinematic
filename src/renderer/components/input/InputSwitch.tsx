import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { simpleUUID } from '@/utils/getUUID';
import React, { useMemo, useState } from 'react';

export function InputSwitch({
	value,
	onChange,
	label,
	description,
	details,
	content,
	card,
	...props
}: {
	value?: boolean;
	onChange?: (value: boolean) => void;
	label?: string;
	description?: string;
	details?: string;
	content?: React.ReactNode;
	card?: boolean;
	props?: any;
}) {
	const uuid = useMemo(simpleUUID, []);

	return (
		<div className={cn('flex flex-col gap-4', card && 'rounded-lg border p-4')}>
			<div className="flex items-center justify-between">
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
				<Switch
					id={uuid}
					checked={value}
					{...(onChange ? { onCheckedChange: onChange } : {})}
					{...props}
				/>
			</div>
			{details && <p className="text-sm text-muted-foreground">{details}</p>}
			{content && <div>{content}</div>}
		</div>
	);
}
