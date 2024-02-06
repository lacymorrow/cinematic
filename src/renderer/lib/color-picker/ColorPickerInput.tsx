import '@/renderer/lib/color-picker/assembly';
import '@/renderer/lib/color-picker/assembly.min.css';
import '@/renderer/lib/color-picker/color-picker.css';
import ColorPicker from '@mapbox/react-colorpickr';
import { useCallback, useState } from 'react';

export function ColorPickerInput({
	value,
	onChange,
}: {
	value?: string;
	onChange?: (color: string) => void;
}) {
	const handleChange = (color: string) => {
		if (onChange) {
			onChange(color);
		}
	};

	return (
		<>
			<ColorPicker
				initialValue={value}
				colorSpace="hex"
				onChange={console.log}
				eyedropper
			/>
		</>
	);
}
