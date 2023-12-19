import { Button } from '@/components/ui/button';
import { BookmarkIcon } from '@radix-ui/react-icons';
import { useNavigate } from 'react-router-dom';

export function LikedEmptyPlaceholder() {
	const navigate = useNavigate();
	const handleClick = () => {
		navigate(-1);
	};

	return (
		<div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
			<div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
				<BookmarkIcon className="w-16 h-16 text-muted-foreground" />
				<h3 className="mt-4 text-lg font-semibold">No media liked</h3>
				<p className="mb-4 mt-2 text-sm text-muted-foreground">
					You have not liked any media yet, don&apos;t you like anything?
				</p>
				<Button size="sm" className="relative" onClick={handleClick}>
					Back to Library
				</Button>
			</div>
		</div>
	);
}
