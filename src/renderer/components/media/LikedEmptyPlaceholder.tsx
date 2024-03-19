import { Button } from '@/components/ui/button';
import { $placeholders } from '@/config/strings';
import { BackIcon, DislikedIcon } from '@/renderer/config/icons';
import { useNavigate } from 'react-router-dom';

export function LikedEmptyPlaceholder() {
	const navigate = useNavigate();
	const handleClick = () => {
		navigate(-1);
	};

	return (
		<div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
			<div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center p-2">
				<DislikedIcon className="w-16 h-16 text-muted-foreground" />
				<h3 className="mt-4 text-lg font-semibold">
					{$placeholders.liked.title}
				</h3>
				<p className="mb-4 mt-2 text-sm text-muted-foreground">
					{$placeholders.liked.description}
				</p>
				<Button
					size="sm"
					className="relative flex items-center justify-center gap-2"
					onClick={handleClick}
				>
					<BackIcon /> {$placeholders.liked.button}
				</Button>
			</div>
		</div>
	);
}
