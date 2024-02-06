import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { simpleUUID } from '@/utils/getUUID';
import { throttle } from '@/utils/throttle';
import { useCallback, useMemo, useState } from 'react';
import Chrome from '@uiw/react-color-chrome';
import { GithubPlacement } from '@uiw/react-color-github';

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { contrastColor } from '@/utils/contrastColor';

export function InputColor({
	value,
	onChange,
	label,
	description,
	details,

	throttleDelay,
	...props
}: {
	value?: string;
	onChange?: (value: string) => void;
	label?: string;
	description?: string;
	details?: string;
	throttleDelay?: number;
	props?: any;
}) {
	const [color, setColor] = useState(value || '#000000');

	const uuid = useMemo(simpleUUID, []);
	const invertedColor = useMemo(() => contrastColor(color, true), [color]);

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
							{description && <p>{description}</p>}
						</div>
					</div>
					<PopoverTrigger asChild>
						<Button
							style={{
								backgroundColor: color,
								color: invertedColor,
							}}
						>
							Open
						</Button>
					</PopoverTrigger>
					<PopoverContent>
						<Chrome
							color={color}
							placement={GithubPlacement.TopRight}
							onChange={(result) => {
								handleChange(result.hex);
							}}
						/>
					</PopoverContent>

					{details && (
						<p className="text-xs text-muted-foreground">{details}</p>
					)}
				</div>
			</Popover>
		</>
	);
}
