import { Button } from '@/components/ui/button';
import { $placeholders } from '@/config/strings';
import { ViewNoneIcon } from '@radix-ui/react-icons';

export function MediaEmptyPlaceholder() {
	const handleClick = () => {
		window.electron.openMediaPath();
	};

	return (
		<div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
			<div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center p-2">
				<ViewNoneIcon className="w-16 h-16 text-muted-foreground" />
				<h3 className="mt-4 text-lg font-semibold">
					{$placeholders.media.title}
				</h3>
				<p className="mb-4 mt-2 text-sm text-muted-foreground">
					{$placeholders.media.description}
				</p>
				<Button size="sm" className="relative" onClick={handleClick}>
					{$placeholders.media.button}
				</Button>
			</div>
		</div>
	);
}
