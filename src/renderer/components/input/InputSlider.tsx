import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { simpleUUID } from '@/utils/getUUID';
import React, { useCallback, useMemo } from 'react';
import { ClearButton } from './ClearButton';

export function InputSlider({
	value,
	defaultValue,
	onChange,
	label,
	description,
	details,
	content,
	input,

	min,
	max,
	step,

	...props
}: {
	value?: number;
	defaultValue?: number;
	onChange?: (value: number) => void;
	label?: string;
	description?: string;
	details?: string;
	content?: React.ReactNode;
	input?: boolean; // show input field
	min?: number;
	max?: number;
	step?: number;
	props?: any;
}) {
	const uuid = useMemo(simpleUUID, []);

	const handleInputChange = useCallback(
		(v: number) => {
			const val = v;
			// // check valid range
			// if (typeof min !== 'undefined' && val < min) return;
			// if (typeof max !== 'undefined' && val > max) return;

			// // check valid step size, including floating point
			// if (typeof step !== 'undefined') {
			// 	const remainder = val % step;
			// 	if (remainder !== 0) {
			// 		// round to nearest step
			// 		val = Math.round(val / step) * step;
			// 	}
			// }

			if (onChange) {
				onChange(val);
			}
		},
		[onChange],
	);

	const handleChange = useCallback(
		(val: number[]) => {
			const [result] = val;

			if (onChange) {
				onChange(result);
			}
		},
		[onChange],
	);

	const handleClear = useCallback(() => {
		if (onChange) {
			onChange(defaultValue || 0);
		}
	}, [defaultValue, onChange]);

	return (
		<div className="flex flex-col justify-between gap-2">
			<div className="flex flex-row items-start justify-between">
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
				{value && (
					<>
						{input ? (
							<Input
								value={String(value)}
								onChange={(e) => {
									const val = parseFloat(e.target.value);
									if (!Number.isNaN(val)) {
										handleInputChange(val);
									}
								}}
								type="number"
								className="w-auto mx-2"
								min={min}
								max={max}
								step={step}
								{...props}
							/>
						) : (
							<div className="flex flex-col items-end">
								<p className={cn('text-muted-foreground flex')}>{value}</p>
								{typeof defaultValue === 'number' && value !== defaultValue && (
									<ClearButton onClick={handleClear} className="static" />
								)}
							</div>
						)}
					</>
				)}
			</div>
			<Slider
				id={uuid}
				onValueChange={handleChange}
				value={[value ?? defaultValue ?? 0]}
				min={min}
				max={max}
				step={step}
				{...props}
			/>
			{details && <p className="text-sm text-muted-foreground">{details}</p>}

			{content && <div>{content}</div>}
		</div>
	);
}
