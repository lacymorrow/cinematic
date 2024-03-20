// MAGIC!
// Create a menu for the renderer process, based on the main process menu
// This creates a serializable version of the menu so that we can render an HTML version of it

import { Menu, MenuItemConstructorOptions } from 'electron';

// This is necessary because Electron's Menu class is not serializable
export const serializeMenu = (
	menu: Menu | null,
): MenuItemConstructorOptions[] => {
	if (!menu) return [];
	return menu.items.map((item: any) => {
		// MenuItem properties that are passed to the renderer process
		const serialized: MenuItemConstructorOptions = {
			label: item.label,
			id: item.id,
			type: item.type,
			accelerator: item.accelerator,
			// icon: item.icon,
			sublabel: item.sublabel,
			enabled: item.enabled,
			visible: item.visible,
			checked:
				typeof item.checked === 'function' ? item.checked() : item.checked,
		};

		if (item.submenu) {
			serialized.submenu = serializeMenu(item.submenu);
		}

		return serialized;
	});
};

// Allow the renderer process to trigger a menu item by ID, so that the click events are triggered
export const triggerMenuItemById = (menu: Menu | null, id: string) => {
	if (!menu) return;
	menu.getMenuItemById(id)?.click();
};
