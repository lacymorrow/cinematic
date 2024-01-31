import { buttonVariants } from '@/components/ui/button';
import { nav } from '@/renderer/config/nav';
import { Link } from 'react-router-dom';

type Props = {};

export function Home(props: Props) {
	return (
		<div className="flex flex-col gap-4 items-center">
			<h1>Hello World</h1>
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
