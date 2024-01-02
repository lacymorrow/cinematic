import { Button } from '@/components/ui/button';
import {
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';

export function DialogContentNewPlaylist({ mediaId }: { mediaId: string }) {
	const [playlistInput, setPlaylistInput] = React.useState('');

	const handlePlaylistInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.value.match('^[0-9a-zA-Z ]{0,36}$') != null) {
			setPlaylistInput(e.target.value);
		}
	};

	const handleCreatePlaylist = () => {
		window.electron.addToPlaylist(mediaId, playlistInput);
	};

	return (
		<DialogContent className="sm:max-w-md">
			<DialogHeader>
				<DialogTitle>New Playlist</DialogTitle>
				<DialogDescription>
					Create a new playlist with this file.
				</DialogDescription>
			</DialogHeader>
			<div className="grid w-full items-center gap-1.5">
				<Label htmlFor="playlist">Playlist name</Label>
				<Input
					type="text"
					id="playlist"
					placeholder="Playlist name..."
					value={playlistInput}
					onChange={handlePlaylistInput}
				/>
				<p className="text-muted-foreground text-xs">
					Short and simple: letters, numbers, and spaces.
				</p>
			</div>
			<DialogFooter>
				<DialogClose asChild>
					<Button type="button" variant="secondary">
						Cancel
					</Button>
				</DialogClose>
				<DialogClose asChild>
					<Button type="submit" onClick={handleCreatePlaylist}>
						Confirm
					</Button>
				</DialogClose>
			</DialogFooter>
		</DialogContent>
	);
}
