// todo: clear button cannot be inside button
import { simpleUUID } from '@/utils/getUUID';
import { throttle } from '@/utils/throttle';
import Chrome from '@uiw/react-color-chrome';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { invertColor } from '@/utils/invertColor';
import { ClearButton } from './ClearButton';

export function InputColorThrottled({
	value,
	onChange,
	label,
	description,
	details,
	buttonText,

	throttleDelay,
	...props
}: {
	value?: string;
	onChange?: (value: string) => void;
	label?: string;
	description?: string;
	details?: string;
	buttonText?: string;
	throttleDelay?: number;
	props?: any;
}) {
	const [color, setColor] = useState(value || '#000000');

	const uuid = useMemo(simpleUUID, []);

	const backgroundColor = useMemo(() => color.slice(0, 7), [color]);

	const foregroundColor = useMemo(() => {
		try {
			return invertColor(backgroundColor, true);
		} catch (error) {
			return '';
		}
	}, [backgroundColor]);

	const throttledOnChange = useMemo(() => {
		if (throttleDelay && onChange) {
			return throttle(onChange, throttleDelay);
		}
		return onChange;
	}, [throttleDelay, onChange]);

	const handleChange = useCallback(
		(result: string) => {
			setColor(result);
			if (throttledOnChange) {
				throttledOnChange(result);
			}
		},
		[throttledOnChange],
	);

	const handleClear = useCallback(() => {
		handleChange('');
	}, [handleChange]);
	return (
		<>
			<Popover>
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
					</div>
					<PopoverTrigger className="relative" asChild>
						<Button
							style={{
								backgroundColor,
								color: foregroundColor,
							}}
							{...props}
						>
							{buttonText || 'Select Color'}
							{color && (
								<ClearButton
									onClick={handleClear}
									style={{ color: foregroundColor }}
								/>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="flex items-center justify-center">
						<Chrome
							color={color || undefined}
							// @ts-ignore
							placement={false}
							onChange={(result) => {
								handleChange(result.hexa);
							}}
						/>
					</PopoverContent>

					{details && (
						<p className="text-sm text-muted-foreground">{details}</p>
					)}
				</div>
			</Popover>
		</>
	);
}
