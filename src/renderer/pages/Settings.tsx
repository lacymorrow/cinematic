import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/renderer/components/ui/ModeToggle';
import { useGlobalContext } from '@/renderer/context/global-context';
import { Link } from 'react-router-dom';

type Props = {};

export function Settings(props: Props) {
	const context = useGlobalContext();

	return (
		<div className="flex flex-col gap-4">
			<h1>Settings</h1>
			<div>
				<span>Change theme: </span>
				<ModeToggle />
			</div>
			<Link to="/" className={cn(buttonVariants())}>
				Home
			</Link>
		</div>
	);
}
