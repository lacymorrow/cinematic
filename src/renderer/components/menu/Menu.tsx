import {
	Menubar,
	MenubarCheckboxItem,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarShortcut,
	MenubarSub,
	MenubarSubContent,
	MenubarSubTrigger,
	MenubarTrigger,
} from '@/components/ui/menubar';
import { pathSettings } from '@/config/nav';
import { $app } from '@/config/strings';
import { cn } from '@/lib/utils';
import { EnterFullScreenIcon } from '@radix-ui/react-icons';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function Menu({ className }: { className?: string }) {
	const navigate = useNavigate();

	const handleClickAbout = useCallback(() => {
		// todo
	}, []);

	const handleClickPreferences = useCallback(() => {
		navigate(pathSettings);
	}, [navigate]);

	const handleClickClose = useCallback(() => {
		// todo
	}, []);

	return (
		<Menubar
			className={cn(
				'rounded-none border-b border-none px-2 lg:px-4',
				className,
			)}
		>
			<MenubarMenu>
				<MenubarTrigger className="font-bold">{$app.name}</MenubarTrigger>
				<MenubarContent>
					<MenubarItem onClick={handleClickAbout}>
						About {$app.name}
					</MenubarItem>
					<MenubarSeparator />
					<MenubarItem onClick={handleClickPreferences}>
						Preferences... <MenubarShortcut>⌘,</MenubarShortcut>
					</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>
						Hide {$app.name}... <MenubarShortcut>⌘H</MenubarShortcut>
					</MenubarItem>
					<MenubarItem>
						Hide Others... <MenubarShortcut>⇧⌘H</MenubarShortcut>
					</MenubarItem>
					<MenubarShortcut />
					<MenubarItem>
						Quit {$app.name} <MenubarShortcut>⌘Q</MenubarShortcut>
					</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger className="relative">File</MenubarTrigger>
				<MenubarContent>
					<MenubarItem>
						Add Media... <MenubarShortcut>⌘O</MenubarShortcut>
					</MenubarItem>
					<MenubarSub>
						<MenubarSubTrigger>New</MenubarSubTrigger>
						<MenubarSubContent className="w-[230px]">
							<MenubarItem>
								Playlist <MenubarShortcut>⌘N</MenubarShortcut>
							</MenubarItem>
							{/* todo */}
							{/* <MenubarItem disabled>
                Playlist from Selection <MenubarShortcut>⇧⌘N</MenubarShortcut>
              </MenubarItem> */}
							{/* <MenubarItem>Playlist Folder</MenubarItem> */}
						</MenubarSubContent>
					</MenubarSub>
					{/* <MenubarItem>
						Open Stream URL... <MenubarShortcut>⌘U</MenubarShortcut>
					</MenubarItem> */}
					<MenubarSeparator />
					<MenubarItem disabled>
						Play File <MenubarShortcut>⌘P</MenubarShortcut>
					</MenubarItem>
					<MenubarItem disabled>
						Show in Finder <MenubarShortcut>⇧⌘R</MenubarShortcut>
					</MenubarItem>
					<MenubarItem onClick={handleClickClose}>
						Close Window <MenubarShortcut>⌘W</MenubarShortcut>
					</MenubarItem>
					{/* <MenubarSeparator />
					<MenubarSub>
						<MenubarSubTrigger>Library</MenubarSubTrigger>
						<MenubarSubContent>
							<MenubarItem>Update Cloud Library</MenubarItem>
							<MenubarItem>Update Genius</MenubarItem>
							<MenubarSeparator />
							<MenubarItem>Organize Library...</MenubarItem>
							<MenubarItem>Export Library...</MenubarItem>
							<MenubarSeparator />
							<MenubarItem>Import Playlist...</MenubarItem>
							<MenubarItem disabled>Export Playlist...</MenubarItem>
							<MenubarItem>Show Duplicate Items</MenubarItem>
							<MenubarSeparator />
							<MenubarItem>Get Album Artwork</MenubarItem>
							<MenubarItem disabled>Get Track Names</MenubarItem>
						</MenubarSubContent>
					</MenubarSub> */}
				</MenubarContent>
			</MenubarMenu>
			{/* <MenubarMenu>
				<MenubarTrigger>Edit</MenubarTrigger>
				<MenubarContent>
					<MenubarItem disabled>
						Undo <MenubarShortcut>⌘Z</MenubarShortcut>
					</MenubarItem>
					<MenubarItem disabled>
						Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
					</MenubarItem>
					<MenubarSeparator />
					<MenubarItem disabled>
						Cut <MenubarShortcut>⌘X</MenubarShortcut>
					</MenubarItem>
					<MenubarItem disabled>
						Copy <MenubarShortcut>⌘C</MenubarShortcut>
					</MenubarItem>
					<MenubarItem disabled>
						Paste <MenubarShortcut>⌘V</MenubarShortcut>
					</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>
						Select All <MenubarShortcut>⌘A</MenubarShortcut>
					</MenubarItem>
					<MenubarItem disabled>
						Deselect All <MenubarShortcut>⇧⌘A</MenubarShortcut>
					</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>
						Smart Dictation...{' '}
						<MenubarShortcut>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								className="h-4 w-4"
								viewBox="0 0 24 24"
							>
								<path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12" />
								<circle cx="17" cy="7" r="5" />
							</svg>
						</MenubarShortcut>
					</MenubarItem>
					<MenubarItem>
						Emoji & Symbols{' '}
						<MenubarShortcut>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								className="h-4 w-4"
								viewBox="0 0 24 24"
							>
								<circle cx="12" cy="12" r="10" />
								<path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
							</svg>
						</MenubarShortcut>
					</MenubarItem>
				</MenubarContent>
			</MenubarMenu> */}
			<MenubarMenu>
				<MenubarTrigger>View</MenubarTrigger>
				<MenubarContent>
					<MenubarCheckboxItem checked disabled>
						Show Watching Next
					</MenubarCheckboxItem>
					<MenubarCheckboxItem>Show Runtime</MenubarCheckboxItem>
					<MenubarSeparator />
					<MenubarItem inset disabled>
						Show Status Bar
					</MenubarItem>
					<MenubarSeparator />
					<MenubarItem inset disabled>
						Hide Sidebar
					</MenubarItem>
					<MenubarItem disabled>
						<EnterFullScreenIcon className="mr-2" />
						Enter Full Screen <MenubarShortcut>⌘F</MenubarShortcut>
					</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
			{/* <MenubarMenu>
        <MenubarTrigger className="hidden md:block">Account</MenubarTrigger>
        <MenubarContent forceMount>
          <MenubarLabel inset>Switch Account</MenubarLabel>
          <MenubarSeparator />
          <MenubarRadioGroup value="benoit">
            <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
            <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
            <MenubarRadioItem value="Luis">Luis</MenubarRadioItem>
          </MenubarRadioGroup>
          <MenubarSeparator />
          <MenubarItem inset>Manage Famliy...</MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset>Add Account...</MenubarItem>
        </MenubarContent>
      </MenubarMenu> */}
		</Menubar>
	);
}
