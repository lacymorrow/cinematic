import { buttonVariants } from '@/components/ui/button';
import nav from '@/config/nav';
import { useGlobalContext } from '@/renderer/context/global-context';
import { Link } from 'react-router-dom';

type Props = {};

export function Home(props: Props) {
	const context = useGlobalContext();

	return (
		<div className="flex flex-col gap-4 items-center">
			<h1>Hello World</h1>
			<Link to={nav.settings.path} className={buttonVariants()}>
				{nav.settings.name}
			</Link>
		</div>
	);
}
