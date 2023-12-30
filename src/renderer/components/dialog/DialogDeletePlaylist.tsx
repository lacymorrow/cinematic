import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { CloseIcon } from '@/renderer/config/icons';
import { CollectionItemType } from '@/types/media';

export function DialogDeletePlaylist({
	className,
	playlist,
}: {
	className?: string;
	playlist: CollectionItemType;
}) {
	const handleSubmit = () => {
		window.electron.deletePlaylist(playlist.id);
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger
				onClick={(e) => {
					e.stopPropagation();
					e.nativeEvent.preventDefault();
				}}
			>
				<div
					className={cn(
						'h-full flex items-center justify-center text-muted-foreground transition-opacity group-hover:opacity-90 group-focus-within:opacity-90 hover:text-foreground -m-2 p-2',
						className,
					)}
				>
					<CloseIcon />
				</div>
			</AlertDialogTrigger>
			<AlertDialogContent
				onClick={(e) => {
					e.stopPropagation();
					e.nativeEvent.preventDefault();
				}}
			>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Are you sure you want to delete this playlist?
					</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete the
						playlist <b>{playlist.name}</b>.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleSubmit}>Delete</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
