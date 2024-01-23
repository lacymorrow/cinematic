import { buttonVariants } from '@/components/ui/button';
import nav from '@/config/nav';
import { $settings } from '@/config/strings';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/renderer/components/ui/ModeToggle';
import { useGlobalContext } from '@/renderer/context/global-context';
import { Link } from 'react-router-dom';

export function Settings() {
	const { settings } = useGlobalContext();

	return (
		<div className="flex flex-col gap-4 items-center">
			<h1>{nav.settings.name}</h1>
			<div>
				<h2>{$settings.theme.themeLabel} </h2>
				<p>{$settings.theme.themeDescription}</p>
			</div>
			<ModeToggle />
			<pre>{JSON.stringify(settings, null, 2)}</pre>
			<Link
				to={nav.home.path}
				className={cn(buttonVariants())}
				draggable={false}
			>
				{nav.home.name}
			</Link>
		</div>
	);
}
