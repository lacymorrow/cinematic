import { buttonVariants } from '@/components/ui/button';
import { nav } from '@/renderer/config/nav';
import React from 'react';
import { Link } from 'react-router-dom';
import { InputComboboxForm } from '../input/InputComboboxForm';
import { InputSelectForm } from '../input/InputSelectForm';
import { InputSlider } from '../input/InputSlider';

type Props = {};

export function Home(props: Props) {
	const [val, setVal] = React.useState(50);
	return (
		<div className="flex flex-col gap-4 items-center">
			<h1>Hello World</h1>
			<InputComboboxForm
				items={[
					{
						value: 'allowSounds',
						label: 'Allow sounds',
					},
					{
						value: 'allowNotifications',
						label: 'Allow notifications',
					},
				]}
				value="allowSounds"
				label="General"
				description="Select your general preferences."
				onChange={(value) => {
					console.log(value);
				}}
			/>
			<InputSelectForm
				items={[
					{
						value: 'allowSounds',
						label: 'Allow sounds',
					},
					{
						value: 'allowNotifications',
						label: 'Allow notifications',
					},
				]}
				value="allowSounds"
				label="General"
				description="Select your general preferences."
				onChange={(value) => {
					console.log(value);
				}}
			/>
			<InputSlider
				value={val}
				onChange={(value) => {
					setVal(value);
				}}
				label="Volume"
				description="Adjust the volumevolumevolumevolumevolumevolumevolume of the application."
				min={0}
				max={100}
				step={1}
				defaultValue={50}
			/>
			<Link
				to={nav.settings.href}
				className={buttonVariants()}
				draggable={false}
			>
				{nav.settings.title}
			</Link>
		</div>
	);
}
