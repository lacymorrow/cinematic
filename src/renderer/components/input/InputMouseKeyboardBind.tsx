import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { simpleUUID } from '@/utils/getUUID';
import keycodeToChar from '@/utils/keycodeToChar';
import { stopEvent } from '@/utils/stopEvent';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CrossButton } from './CrossButton';

const mouseButtons = [
	'Left',
	'Middle',
	'Right',
	'Back',
	'Forward',
	'Extra 1',
	'Extra 2',
];

export const prettyPrintBind = (bind: string | undefined) => {
	if (!bind?.includes(':')) {
		return bind;
	}

	const [type, value] = bind.split(':');
	const button = parseInt(value, 10);

	if (type === 'keyboard') {
		return `⌨️ Keyboard ${
			button in keycodeToChar ? keycodeToChar[button] : value
		}`;
	}

	if (type === 'mouse') {
		return `🖱️ Mouse ${value in mouseButtons ? mouseButtons[button] : value}`;
	}

	return bind;
};
export function InputMouseKeyboardBind({
	value,
	onChange,
	label,
	description,
	details,
	buttonText,
	placeholder,
	className,
	...props
}: {
	value?: string;
	onChange?: (value: string) => void;
	label?: string;
	description?: string;
	details?: string;
	buttonText?: string;
	placeholder?: string;
	className?: string;
	props?: any;
}) {
	const [currentValue, setCurrentValue] = useState(value);
	const [listening, setListening] = useState(false);

	const handleChange = useCallback(
		(result: string) => {
			onChange?.(result);
			setCurrentValue(result);
		},
		[onChange],
	);

	useEffect(() => {
		const listener = (e: KeyboardEvent | PointerEvent | MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (e.type === 'contextmenu') {
				return;
			}

			if (e instanceof KeyboardEvent) {
				handleChange(`keyboard:${e.which}`);
			} else if (e instanceof PointerEvent || e instanceof MouseEvent) {
				handleChange(`mouse:${e.button}`);
			}

			setListening(false);
		};

		if (listening) {
			document.addEventListener('keydown', listener);
			// We use pointerup (vs down) to avoid the context menu on right click
			document.addEventListener('pointerup', listener);
			document.addEventListener('pointerdown', stopEvent);
			document.addEventListener('contextmenu', stopEvent);
		}
		return () => {
			document.removeEventListener('keydown', listener);
			document.removeEventListener('pointerup', listener);
			document.removeEventListener('pointerdown', stopEvent);
			document.removeEventListener('contextmenu', stopEvent);
		};
	}, [listening, handleChange]);

	const uuid = useMemo(simpleUUID, []);

	const handleSetBind = useCallback(() => {
		setListening(true);
	}, []);

	const handleClear = useCallback(() => {
		setCurrentValue('');
	}, []);
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
			</div>
			<div className="relative w-full">
				<Button
					id={uuid}
					onClick={handleSetBind}
					className={cn('w-full', className)}
					variant="secondary"
					disabled={listening}
					{...props}
				>
					{listening
						? buttonText || 'Waiting, press any button or key...'
						: prettyPrintBind(currentValue) ||
							placeholder ||
							'Click to set bind...'}
				</Button>
				{currentValue && <CrossButton onClick={handleClear} />}
			</div>
			{details && <p className="text-sm text-muted-foreground">{details}</p>}
		</div>
	);
}
