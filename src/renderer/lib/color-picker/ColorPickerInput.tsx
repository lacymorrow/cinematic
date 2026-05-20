import '@/renderer/lib/color-picker/assembly';
import '@/renderer/lib/color-picker/assembly.min.css';
import '@/renderer/lib/color-picker/color-picker.css';
import ColorPicker from '@mapbox/react-colorpickr';

type ColorPickerOnChange = Parameters<
	NonNullable<React.ComponentProps<typeof ColorPicker>['onChange']>
>[0];

export function ColorPickerInput({
	value,
	onChange,
}: {
	value?: string;
	onChange?: (color: string) => void;
}) {
	const handleChange = (color: ColorPickerOnChange) => {
		if (onChange) {
			onChange((color as { hex?: string }).hex ?? '');
		}
	};

	return (
		<>
			<ColorPicker
				initialValue={value}
				colorSpace="hex"
				onChange={handleChange}
				eyedropper
			/>
		</>
	);
}
