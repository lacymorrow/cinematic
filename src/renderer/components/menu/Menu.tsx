// Todo: Radio and Checkbox Menu items are not working
import {
	Menubar,
	MenubarCheckboxItem,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarRadioGroup,
	MenubarRadioItem,
	MenubarSeparator,
	MenubarShortcut,
	MenubarSub,
	MenubarSubContent,
	MenubarSubTrigger,
	MenubarTrigger,
} from '@/components/ui/menubar';
import { KEYS } from '@/config/keys';
import { cn } from '@/lib/utils';
import { useGlobalContext } from '@/renderer/context/global-context';
import { MenuItemConstructorOptions } from 'electron/renderer';

// if the label contains an ampersand followed by a character that is not an ampersand, underline the character
// for example, &File becomes F̲ile and &&File becomes &File
// (see https://www.electronjs.org/docs/latest/api/menu#menusetapplicationmenumenu)
function formatLabel(label: string | undefined | null) {
	if (!label) {
		return null;
	}

	if (/^[^&]*&([^&])/g.test(label)) {
		const index = label.indexOf('&');
		const firstPart = label.slice(0, index);
		const secondPart = label.slice(index + 1);

		return (
			<span>
				{firstPart}
				<u>{secondPart[0]}</u>
				{secondPart.slice(1).replace(/&&/g, '&')}
			</span>
		);
	}

	return label.replace(/&&/g, '&');

	// 	return <span className="text-sm">{label.replace(/&/g, '&&')}</span>;
	// label.replace(/^&([^&])/g, '$1').replace(/^&&([^&])/g, '$1');
}

function convertAcceleratorToElement(accelerator?: string | null) {
	if (!accelerator) {
		return null;
	}

	const keys = accelerator.split('+');
	const modifierKeys = keys.slice(0, -1);
	const key = keys[keys.length - 1];

	const CommandOrControl = window.electron.isMac ? KEYS.COMMAND : KEYS.CONTROL;
	const unicodeModifiers: { [key: string]: string } = {
		CommandOrControl,
		CmdOrCtrl: CommandOrControl,
		Command: KEYS.COMMAND,
		Cmd: KEYS.COMMAND,
		Control: KEYS.CONTROL,
		Ctrl: KEYS.CONTROL,
		Shift: KEYS.SHIFT,
		Alt: KEYS.OPTION,
		Option: KEYS.OPTION,
		Super: KEYS.COMMAND,
		Plus: KEYS.PLUS,
	};

	const modifierElements = modifierKeys.map((modifierKey) => {
		const unicodeKey = unicodeModifiers[modifierKey] || modifierKey;

		return <span key={crypto.randomUUID()}>{unicodeKey}</span>;
	});

	return (
		<MenubarShortcut>
			{modifierElements}
			{key}
		</MenubarShortcut>
	);
}

export function Menu({ className }: { className?: string }) {
	const { appMenu } = useGlobalContext();

	const renderMenuItems = (menuItems: MenuItemConstructorOptions[]) => {
		return menuItems.map((item) => {
			if (item.visible === false) {
				return null;
			}

			const key = item.id || crypto.randomUUID();
			if (item.type === 'separator') {
				return <MenubarSeparator key={key} />;
			}

			if (item.type === 'checkbox') {
				return (
					<MenubarCheckboxItem
						key={key}
						checked={item.checked}
						disabled={item.enabled === false}
					>
						{formatLabel(item.label)}
					</MenubarCheckboxItem>
				);
			}

			if (item.type === 'radio') {
				return (
					<MenubarRadioGroup key={key} value={item.checked ? key : ''}>
						<MenubarRadioItem value={key} disabled={item.enabled === false}>
							{formatLabel(item.label)}
						</MenubarRadioItem>
					</MenubarRadioGroup>
				);
			}

			if (item.type === 'submenu') {
				return (
					<MenubarSub key={key}>
						<MenubarSubTrigger disabled={item.enabled === false}>
							{formatLabel(item.label)}
						</MenubarSubTrigger>
						<MenubarSubContent>
							{Array.isArray(item.submenu) && renderMenuItems(item.submenu)}
						</MenubarSubContent>
					</MenubarSub>
				);
			}

			return (
				<MenubarItem
					disabled={item.enabled === false}
					key={key}
					onClick={() => {
						if (item.id) {
							window.electron.triggerAppMenuItemById(item.id);
						}
					}}
					className="gap-2"
				>
					{formatLabel(item.label)}
					{convertAcceleratorToElement(item.accelerator)}
				</MenubarItem>
			);
		});
	};

	return (
		<Menubar
			className={cn(
				'rounded-none border-b border-none px-2 lg:px-4',
				className,
			)}
		>
			<MenubarMenu>
				{Array.isArray(appMenu) &&
					appMenu.map((item: any, index: number) => {
						return (
							<MenubarMenu key={crypto.randomUUID()}>
								<MenubarTrigger
									// Bold the first Menu Item (the App Name)
									{...(window.electron.isMac && index === 0
										? { className: 'font-bold' }
										: {})}
								>
									{formatLabel(item.label)}
								</MenubarTrigger>
								<MenubarContent>{renderMenuItems(item.submenu)}</MenubarContent>
							</MenubarMenu>
						);
					})}
			</MenubarMenu>
		</Menubar>
	);
}

// 				<MenubarTrigger className="font-bold">{appName}</MenubarTrigger>
// 				<MenubarContent>
// 					<MenubarItem onClick={handleClickAbout}>About {appName}</MenubarItem>
// 					<MenubarSeparator />
// 					<MenubarItem onClick={handleClickPreferences}>
// 						Preferences... <MenubarShortcut>⌘,</MenubarShortcut>
// 					</MenubarItem>
// 					<MenubarSeparator />
// 					<MenubarItem>
// 						Hide {appName}... <MenubarShortcut>⌘H</MenubarShortcut>
// 					</MenubarItem>
// 					<MenubarItem>
// 						Hide Others... <MenubarShortcut>⇧⌘H</MenubarShortcut>
// 					</MenubarItem>
// 					<MenubarShortcut />
// 					<MenubarItem>
// 						Quit {appName} <MenubarShortcut>⌘Q</MenubarShortcut>
// 					</MenubarItem>
// 				</MenubarContent>
// 			</MenubarMenu>
// 			<MenubarMenu>
// 				<MenubarTrigger className="relative">File</MenubarTrigger>
// 				<MenubarContent>
// 					<MenubarItem>
// 						Add Media... <MenubarShortcut>⌘O</MenubarShortcut>
// 					</MenubarItem>
// 					<MenubarSub>
// 						<MenubarSubTrigger>New</MenubarSubTrigger>
// 						<MenubarSubContent className="w-[230px]">
// 							<MenubarItem>
// 								Playlist <MenubarShortcut>⌘N</MenubarShortcut>
// 							</MenubarItem>
// 							{/* todo */}
// 							{/* <MenubarItem disabled>
//                 Playlist from Selection <MenubarShortcut>⇧⌘N</MenubarShortcut>
//               </MenubarItem> */}
// 							{/* <MenubarItem>Playlist Folder</MenubarItem> */}
// 						</MenubarSubContent>
// 					</MenubarSub>
// 					{/* <MenubarItem>
// 						Open Stream URL... <MenubarShortcut>⌘U</MenubarShortcut>
// 					</MenubarItem> */}
// 					<MenubarSeparator />
// 					<MenubarItem disabled>
// 						Play File <MenubarShortcut>⌘P</MenubarShortcut>
// 					</MenubarItem>
// 					<MenubarItem disabled>
// 						Show in Finder <MenubarShortcut>⇧⌘R</MenubarShortcut>
// 					</MenubarItem>
// 					<MenubarItem onClick={handleClickClose}>
// 						Close Window <MenubarShortcut>⌘W</MenubarShortcut>
// 					</MenubarItem>
// 					{/* <MenubarSeparator />
// 					<MenubarSub>
// 						<MenubarSubTrigger>Library</MenubarSubTrigger>
// 						<MenubarSubContent>
// 							<MenubarItem>Update Cloud Library</MenubarItem>
// 							<MenubarItem>Update Genius</MenubarItem>
// 							<MenubarSeparator />
// 							<MenubarItem>Organize Library...</MenubarItem>
// 							<MenubarItem>Export Library...</MenubarItem>
// 							<MenubarSeparator />
// 							<MenubarItem>Import Playlist...</MenubarItem>
// 							<MenubarItem disabled>Export Playlist...</MenubarItem>
// 							<MenubarItem>Show Duplicate Items</MenubarItem>
// 							<MenubarSeparator />
// 							<MenubarItem>Get Album Artwork</MenubarItem>
// 							<MenubarItem disabled>Get Track Names</MenubarItem>
// 						</MenubarSubContent>
// 					</MenubarSub> */}
// 				</MenubarContent>
// 			</MenubarMenu>
// 			{/* <MenubarMenu>
// 				<MenubarTrigger>Edit</MenubarTrigger>
// 				<MenubarContent>
// 					<MenubarItem disabled>
// 						Undo <MenubarShortcut>⌘Z</MenubarShortcut>
// 					</MenubarItem>
// 					<MenubarItem disabled>
// 						Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
// 					</MenubarItem>
// 					<MenubarSeparator />
// 					<MenubarItem disabled>
// 						Cut <MenubarShortcut>⌘X</MenubarShortcut>
// 					</MenubarItem>
// 					<MenubarItem disabled>
// 						Copy <MenubarShortcut>⌘C</MenubarShortcut>
// 					</MenubarItem>
// 					<MenubarItem disabled>
// 						Paste <MenubarShortcut>⌘V</MenubarShortcut>
// 					</MenubarItem>
// 					<MenubarSeparator />
// 					<MenubarItem>
// 						Select All <MenubarShortcut>⌘A</MenubarShortcut>
// 					</MenubarItem>
// 					<MenubarItem disabled>
// 						Deselect All <MenubarShortcut>⇧⌘A</MenubarShortcut>
// 					</MenubarItem>
// 					<MenubarSeparator />
// 					<MenubarItem>
// 						Smart Dictation...{' '}
// 						<MenubarShortcut>
// 							<svg
// 								xmlns="http://www.w3.org/2000/svg"
// 								fill="none"
// 								stroke="currentColor"
// 								strokeLinecap="round"
// 								strokeLinejoin="round"
// 								strokeWidth="2"
// 								className="h-4 w-4"
// 								viewBox="0 0 24 24"
// 							>
// 								<path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12" />
// 								<circle cx="17" cy="7" r="5" />
// 							</svg>
// 						</MenubarShortcut>
// 					</MenubarItem>
// 					<MenubarItem>
// 						Emoji & Symbols{' '}
// 						<MenubarShortcut>
// 							<svg
// 								xmlns="http://www.w3.org/2000/svg"
// 								fill="none"
// 								stroke="currentColor"
// 								strokeLinecap="round"
// 								strokeLinejoin="round"
// 								strokeWidth="2"
// 								className="h-4 w-4"
// 								viewBox="0 0 24 24"
// 							>
// 								<circle cx="12" cy="12" r="10" />
// 								<path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
// 							</svg>
// 						</MenubarShortcut>
// 					</MenubarItem>
// 				</MenubarContent>
// 			</MenubarMenu> */}
// 			<MenubarMenu>
// 				<MenubarTrigger>View</MenubarTrigger>
// 				<MenubarContent>
// 					<MenubarCheckboxItem checked disabled>
// 						Show Watching Next
// 					</MenubarCheckboxItem>
// 					<MenubarCheckboxItem>Show Runtime</MenubarCheckboxItem>
// 					<MenubarSeparator />
// 					<MenubarItem inset disabled>
// 						Show Status Bar
// 					</MenubarItem>
// 					<MenubarSeparator />
// 					<MenubarItem inset disabled>
// 						Hide Sidebar
// 					</MenubarItem>
// 					<MenubarItem disabled>
// 						<EnterFullScreenIcon className="mr-2" />
// 						Enter Full Screen <MenubarShortcut>⌘F</MenubarShortcut>
// 					</MenubarItem>
// 				</MenubarContent>
// 			</MenubarMenu>
// 			{/* <MenubarMenu>
//         <MenubarTrigger className="hidden md:block">Account</MenubarTrigger>
//         <MenubarContent forceMount>
//           <MenubarLabel inset>Switch Account</MenubarLabel>
//           <MenubarSeparator />
//           <MenubarRadioGroup value="benoit">
//             <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
//             <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
//             <MenubarRadioItem value="Luis">Luis</MenubarRadioItem>
//           </MenubarRadioGroup>
//           <MenubarSeparator />
//           <MenubarItem inset>Manage Famliy...</MenubarItem>
//           <MenubarSeparator />
//           <MenubarItem inset>Add Account...</MenubarItem>
//         </MenubarContent>
//       </MenubarMenu> */}
// 		</Menubar>
// 	);
// }
