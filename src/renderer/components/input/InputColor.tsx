// todo: color value is reset when pure black
// todo: clear button cannot be inside button
import { simpleUUID } from '@/utils/getUUID';
import Colorful from '@uiw/react-color-colorful';
import { useCallback, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { invertColor } from '@/utils/invertColor';
import Chrome from '@uiw/react-color-chrome';
import { ClearButton } from './ClearButton';

export function InputColor({
	variant = 'chrome',
	value,
	onChange,
	label,
	description,
	details,
	buttonText,

	...props
}: {
	variant?: 'chrome' | 'colorful';
	value?: string;
	onChange?: (value: string) => void;
	label?: string;
	description?: string;
	details?: string;
	buttonText?: string;
	props?: any;
}) {
	const Component = variant === 'chrome' ? Chrome : Colorful;
	const color = useMemo(() => value || '', [value]);

	const uuid = useMemo(simpleUUID, []);

	const backgroundColor = useMemo(() => color.slice(0, 7), [color]);

	const foregroundColor = useMemo(() => {
		try {
			return invertColor(backgroundColor, true);
		} catch (error) {
			return '';
		}
	}, [backgroundColor]);

	const handleChange = useCallback(
		(result: string) => {
			if (onChange) {
				onChange(result);
			}
		},
		[onChange],
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
						<div className="relative w-full">
							<Button
								style={{
									backgroundColor,
									color: foregroundColor,
								}}
								className="w-full"
								{...props}
							>
								{buttonText || 'Select Color'}
							</Button>
							{color && (
								<ClearButton
									className="absolute right-0 top-0"
									onClick={handleClear}
									style={{ color: foregroundColor }}
								/>
							)}
						</div>
					</PopoverTrigger>
					<PopoverContent className="flex items-center justify-center">
						<Component
							disableAlpha
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
