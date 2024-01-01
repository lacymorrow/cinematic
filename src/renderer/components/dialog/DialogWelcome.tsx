import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { ButtonAddMedia } from '../ui/ButtonAddMedia';

export function DialogWelcome() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline">Share</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Welcome to Cinematic</DialogTitle>
					<DialogDescription>
						Visualize your media. Scan files or directories on your computer or
						external hard drive to fetch information and metadata about your
						media.
					</DialogDescription>

					<DialogDescription>
						To begin, add some files or folders. <br />
						If you&apos;re unsure, you can add your computer&apo;s default{' '}
						<b>Videos</b> or <b>Movies</b> folder. Otherwise, go ahead and add
						some media.
					</DialogDescription>

					<DialogDescription>
						Cinematic will never modify or delete your files. It only looks at
						filenames.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="sm:justify-start">
					<DialogClose asChild>
						<ButtonAddMedia />
					</DialogClose>
					<DialogClose asChild>
						<Button type="submit">
							I&apos;m unsure, import my media folder
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
