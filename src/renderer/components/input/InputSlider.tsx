import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { simpleUUID } from '@/utils/getUUID';
import { throttle } from '@/utils/throttle';
import React, { useCallback, useMemo, useState } from 'react';
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

	throttleDelay = 50,
	...props
}: {
	value?: number;
	defaultValue?: number;
	onChange?: (value: number) => void;
	label?: string;
	description?: string;
	details?: string;
	content?: React.ReactNode;
	throttleDelay?: number;
	input?: boolean; // show input field
	min?: number;
	max?: number;
	step?: number;
	props?: any;
}) {
	const [currentValue, setCurrentValue] = useState(
		typeof value === 'number' ? [value] : [0],
	);
	const uuid = useMemo(simpleUUID, []);

	const throttledOnChange = useMemo(() => {
		if (throttleDelay && onChange) {
			return throttle(onChange, throttleDelay);
		}
		return onChange;
	}, [throttleDelay, onChange]);

	const handleInputChange = useCallback(
		(v: number) => {
			let val = v;
			// check valid range
			if (typeof min !== 'undefined' && val < min) return;
			if (typeof max !== 'undefined' && val > max) return;

			// check valid step size, including floating point
			if (typeof step !== 'undefined') {
				const remainder = val % step;
				if (remainder !== 0) {
					// round to nearest step
					val = Math.round(val / step) * step;
				}
			}

			setCurrentValue([val]);
			if (throttledOnChange) {
				throttledOnChange(val);
			}
		},
		[throttledOnChange, min, max, step],
	);

	const handleChange = useCallback(
		(val: number[]) => {
			const [result] = val;

			setCurrentValue([result]);

			if (throttledOnChange) {
				throttledOnChange(result);
			}
		},
		[throttledOnChange],
	);

	const handleClear = useCallback(() => {
		setCurrentValue([defaultValue || 0]);
		if (throttledOnChange) {
			throttledOnChange(defaultValue || 0);
		}
	}, [defaultValue, throttledOnChange]);

	return (
		<div className="flex flex-col justify-between gap-2">
			<div className="flex flex-row items-center justify-between">
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
				{currentValue && (
					<>
						{input ? (
							<Input
								value={String(currentValue)}
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
							<p className={cn('text-muted-foreground flex')}>
								{currentValue}
								{typeof defaultValue === 'number' &&
									currentValue[0] !== defaultValue && (
										<ClearButton onClick={handleClear} className="static" />
									)}
							</p>
						)}
					</>
				)}
			</div>
			<Slider
				id={uuid}
				onValueChange={handleChange}
				value={currentValue}
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
