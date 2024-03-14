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
import { v4 as uuidv4 } from 'uuid';
import { DragHandle } from '../ui/DragHandle';

export function Menu({ className }: { className?: string }) {
	const { app, appMenu } = useGlobalContext();

	// if the label contains an ampersand followed by a character that is not an ampersand, underline the character
	// for example, &File becomes F̲ile and &&File becomes &File
	// (see https://www.electronjs.org/docs/latest/api/menu#menusetapplicationmenumenu)
	function formatLabel(label: string | undefined | null) {
		if (!label) {
			return null;
		}

		if (app.isMac) {
			return label.replace(/&&/g, '&');
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
	}

	function convertAcceleratorToElement(accelerator?: string | null) {
		if (!accelerator) {
			return null;
		}

		const keys = accelerator.split('+');
		const modifierKeys = keys.slice(0, -1);
		const key = keys[keys.length - 1];

		const CommandOrControl = app.isMac ? KEYS.COMMAND : KEYS.CONTROL;
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

			return <span key={uuidv4()}>{unicodeKey}</span>;
		});

		return (
			<MenubarShortcut>
				{modifierElements}
				{key}
			</MenubarShortcut>
		);
	}

	const renderMenuItems = (menuItems: MenuItemConstructorOptions[]) => {
		return menuItems.map((item) => {
			if (item.visible === false) {
				return null;
			}

			const key = item.id || uuidv4();
			if (item.type === 'separator') {
				return <MenubarSeparator key={key} />;
			}

			if (item.type === 'checkbox') {
				return (
					<MenubarCheckboxItem
						key={key}
						checked={item.checked}
						disabled={item.enabled === false}
						onClick={() => {
							if (item.id) {
								window.electron.triggerAppMenuItemById(item.id);
							}
						}}
					>
						{formatLabel(item.label)}
					</MenubarCheckboxItem>
				);
			}

			if (item.type === 'radio') {
				return (
					<MenubarRadioGroup key={key} value={item.checked ? key : ''}>
						<MenubarRadioItem
							value={key}
							disabled={item.enabled === false}
							onClick={() => {
								if (item.id) {
									window.electron.triggerAppMenuItemById(item.id);
								}
							}}
						>
							{formatLabel(item.label)}
						</MenubarRadioItem>
					</MenubarRadioGroup>
				);
			}

			if (item.type === 'submenu') {
				return (
					<MenubarSub key={key}>
						<MenubarSubTrigger
							disabled={item.enabled === false}
							onClick={() => {
								if (item.id) {
									window.electron.triggerAppMenuItemById(item.id);
								}
							}}
						>
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
				'drag', // Allow the titlebar to be draggable, to reposition the window. Useful when using frameless windows.
				'rounded-none border-b border-none px-4 w-full overflow-hidden text-ellipsis items-stretch',
				app.isMac && 'pl-20',
				className,
			)}
		>
			<DragHandle />
			{/* Hide the Menu Bar on Mac, as it is redundant */}
			{(!app.isMac || app.isDev) &&
				Array.isArray(appMenu) &&
				appMenu.map((item: any, index: number) => {
					return (
						<MenubarMenu key={uuidv4()}>
							<MenubarTrigger
								className={cn(
									'no-drag px-2 sm:px-3', // Draggable elements cannot be interacted with, undo the draggable class
									app.isMac && index === 0 && 'font-bold', // Bold the first Menu Item (the App Name) on Mac
								)}
							>
								{formatLabel(item.label)}
							</MenubarTrigger>
							<MenubarContent>{renderMenuItems(item.submenu)}</MenubarContent>
						</MenubarMenu>
					);
				})}
		</Menubar>
	);
}
