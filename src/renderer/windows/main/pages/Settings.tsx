import { buttonVariants } from '@/components/ui/button';
import { $settings } from '@/config/strings';
import { cn } from '@/lib/utils';
import { nav } from '@/renderer/config/nav';
import { useGlobalContext } from '@/renderer/context/global-context';
import { Link } from 'react-router-dom';

export function Settings() {
	const { settings } = useGlobalContext();

	return (
		<div className="flex flex-col gap-4 items-center">
			<h1>{nav.settings.title}</h1>
			<div>
				<h2>{$settings.theme.themeLabel} </h2>
				<p>{$settings.theme.themeDescription}</p>
			</div>
			<Link
				to={nav.home.href}
				className={cn(buttonVariants())}
				draggable={false}
			>
				{nav.home.title}
			</Link>
		</div>
	);
}
