/*
		InputKeyboardShortcut

		modifierRequired: By default any key can be used, if this is true, a modifier must be provided.
	*/
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useGlobalContext } from '@/renderer/context/global-context';
import { getOS } from '@/utils/getOS';
import { simpleUUID } from '@/utils/getUUID';
import keycodeToChar, {
	modifierKeyCodes,
	specialKeyCodes,
} from '@/utils/keycodeToChar';
import { throttle } from '@/utils/throttle';
import { useCallback, useMemo, useState } from 'react';

export function InputKeyboardShortcut({
	value,
	onChange,
	label,
	description,
	details,
	placeholder = 'Unbound...',
	allowOnlyModifier = false,
	allowOnlyTab = false,
	modifierRequired = false,
	...props
}: {
	value: string;
	onChange?: (value: string) => void;
	label?: string;
	description?: string;
	details?: string;
	placeholder?: string;
	allowOnlyModifier?: boolean;
	allowOnlyTab?: boolean;
	modifierRequired?: boolean;
	props?: any;
}) {
	const { app } = useGlobalContext();
	// Generate a unique ID for the input
	const uuid = useMemo(simpleUUID, []);

	// Display the keys being pushed while trying to set accelerator
	const [pressing, setPressing] = useState(false);
	const [accelerator, setAccelerator] = useState('');

	// Assign modifier key names, different OS' use different key names
	let altKeyName = 'Alt';
	let metaKeyName = 'Meta';
	if (app.os === 'mac') {
		altKeyName = 'Option';
		metaKeyName = 'Command';
	} else if (app.os === 'windows') {
		metaKeyName = 'Windows';
	}

	const handleChange = (result: string) => {
		if (onChange) {
			onChange(result);
		}
	};

	const handleKeyDown = (event: any) => {
		// Start key array with any modifiers
		const keys = [
			event.ctrlKey && 'Control',
			event.metaKey && metaKeyName,
			event.altKey && altKeyName,
			event.shiftKey && 'Shift',
		].filter(Boolean); // Remove false values

		// Prevent tab by default, to maintain accessibility
		if (
			allowOnlyTab &&
			event.which === 9 &&
			(keys.length === 0 || event.shiftKey)
		) {
			setPressing(false);
			return;
		}

		// Clear the value on backspace (8) or delete (46)
		if (keys.length === 0 && (event.which === 8 || event.which === 46)) {
			setPressing(false);
			handleChange('');
			return;
		}

		event.preventDefault();

		// I've not tested every combo to verify it will work in electron, all the documentation they provide:
		// https://www.electronjs.org/docs/api/accelerator#available-key-codes
		if (!specialKeyCodes.has(event.which) && event.which in keycodeToChar) {
			// We allow single-keys to be set, unless `modifierRequired` is passed
			if (modifierRequired && keys.length === 0) {
				return;
			}

			// Save values
			keys.push(keycodeToChar[event.which]);
			handleChange(keys.join('+'));
		} else if (
			allowOnlyModifier &&
			modifierKeyCodes.has(event.which) &&
			keys.length === 1
		) {
			// `allowOnlyModifier`: we allow a single, modifier-only key to be set.
			handleChange(keys[0]);
			return;
		}

		// Display current keys pressed
		setPressing(true);
		setAccelerator(keys.join('+'));
	};

	const handleKeyUp = () => {
		setPressing(false);
	};

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

			<Input
				id={uuid}
				onKeyDown={handleKeyDown}
				onKeyUp={handleKeyUp}
				onChange={() => {}}
				value={pressing ? accelerator : value}
				placeholder={placeholder}
				{...props}
			/>

			{details && <p className="text-sm text-muted-foreground">{details}</p>}
		</div>
	);
}
