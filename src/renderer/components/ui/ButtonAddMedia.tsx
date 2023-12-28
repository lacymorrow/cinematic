import { Button } from '@/components/ui/button';
import { $actions } from '@/config/strings';
import { PlusCircledIcon } from '@radix-ui/react-icons';

export function ButtonAddMedia() {
	const handleClick = () => {
		window.electron.openMediaPath();
	};

	return (
		<Button onClick={handleClick} className="group shrink-0 w-max">
			<PlusCircledIcon className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
			{$actions.addMedia}
		</Button>
	);
}
