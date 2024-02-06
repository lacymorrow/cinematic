import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { simpleUUID } from '@/utils/getUUID';
import { stopEvent } from '@/utils/stopEvent';
import { throttle } from '@/utils/throttle';
import { CrossCircledIcon } from '@radix-ui/react-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
					{description && <p>{description}</p>}
				</div>
			</div>
			<div className="relative w-full">
				<Button
					id={uuid}
					onClick={handleSetBind}
					className={cn('w-full', className)}
					variant="secondary"
					disabled={listening}
				>
					{listening
						? buttonText || 'Waiting for bind...'
						: currentValue || placeholder || 'Set bind...'}
				</Button>
				{currentValue && (
					<button
						type="button"
						onClick={handleClear}
						className="text-primary hover:text-muted-foreground absolute z-10 top-0 bottom-0 right-0 px-4 py-2 grid place-content-center"
					>
						<CrossCircledIcon className="w-4 h-4" />
						<span className="sr-only">Clear bind...</span>
					</button>
				)}
			</div>
			{details && <p className="text-xs text-muted-foreground">{details}</p>}
		</div>
	);
}
