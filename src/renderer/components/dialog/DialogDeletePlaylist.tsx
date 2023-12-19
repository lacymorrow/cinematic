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
import { buttonVariants } from '@/components/ui/button';
import { CollectionItemType } from '@/types/media';
import { CrossCircledIcon } from '@radix-ui/react-icons';
import { Link } from 'react-router-dom';

export function DialogDeletePlaylist({
	playlist,
}: {
	playlist: CollectionItemType;
}) {
	const handleSubmit = () => {
		window.electron.deletePlaylist(playlist.id);
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger>
				<div className="h-full flex items-center justify-center text-muted-foreground opacity-0 transition-opacity group-hover:opacity-90 hover:text-foreground -m-2 p-2">
					<CrossCircledIcon />
				</div>
			</AlertDialogTrigger>
			<AlertDialogContent>
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
					<AlertDialogAction>
						<Link
							to="/"
							draggable={false}
							className={buttonVariants()}
							onClick={handleSubmit}
						>
							Delete
						</Link>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
