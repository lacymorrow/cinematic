import { buttonVariants } from '@/components/ui/button';
import { nav } from '@/renderer/config/nav';
import { Link } from 'react-router-dom';
import { InputCheckbox } from '../input/InputCheckbox';
import { InputCheckboxGroup } from '../input/InputCheckboxGroup';
import { InputComboboxForm } from '../input/InputComboboxForm';
import { InputSelectForm } from '../input/InputSelectForm';
import { InputSlider } from '../input/InputSlider';

type Props = {};

export function Home(props: Props) {
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
			<InputCheckbox
				label="Start on login"
				description="Open the app when you log in to your computer."
				card
			/>
			<InputCheckboxGroup
				label="Sidebar"
				description="Select the default view for the sidebar."
				value={['recents']}
				items={[
					{ value: 'recents', label: 'Recents' },
					{ value: 'home', label: 'Home' },
					{ value: 'starred', label: 'Starred' },
				]}
				card
				onChange={(value) => {
					console.log(value);
				}}
				details="This will change the default view for the sidebar."
			/>
			<InputSlider
				value={50}
				onChange={(value) => {
					console.log(value);
				}}
				label="Volume"
				description="Adjust the volume of the application."
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
