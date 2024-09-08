import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { nav } from '@/renderer/config/nav';
import { useGlobalContext } from '@/renderer/context/global-context';
import { Link } from 'react-router-dom';
import { InputComboboxForm } from '../input/InputComboboxForm';

export function Home() {
	const { settings, setSettings } = useGlobalContext();

	const handleThemeChange = (value: string) => {
		setSettings({ theme: value as 'light' | 'dark' | 'system' });
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			<h1 className="text-3xl font-bold">Welcome to Electron Hotplate</h1>
			<p className="text-muted-foreground">
				A professional boilerplate for building cross-platform Electron
				applications.
			</p>

			<Card className="w-full max-w-md mx-auto">
				<CardHeader>
					<CardTitle>Quick Settings</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<InputComboboxForm
						items={[
							{ value: 'light', label: 'Light' },
							{ value: 'dark', label: 'Dark' },
							{ value: 'system', label: 'System' },
						]}
						value={settings.theme}
						onChange={handleThemeChange}
						label="Theme"
						description="Select your preferred application theme."
					/>
					<Link to={nav.settings.href} className="block">
						<Button className="w-full">Go to Settings</Button>
					</Link>
				</CardContent>
			</Card>
		</div>
	);
}
