'use strict'
const path = require('path')
const {app, Menu, shell, BrowserWindow} = require('electron')
const {
	is,
	appMenu,
	aboutMenuItem,
	openUrlMenuItem,
	openNewGitHubIssue,
	debugInfo
} = require('electron-util')

const showPreferences = () => {
	console.log('Show Preferences…')
}

const helpSubmenu = [
	openUrlMenuItem({
		label: 'Website',
		url: 'https://github.com/lacymorrow/cinematic'
	}),
	openUrlMenuItem({
		label: 'Source Code',
		url: 'https://github.com/lacymorrow/cinematic'
	}),
	{
		label: 'Report an Issue…',
		click() {
			const body = `
<!-- Please succinctly describe your issue and steps to reproduce it. -->


---

${debugInfo()}`

			openNewGitHubIssue({
				user: 'lacymorrow',
				repo: 'cinematic',
				body
			})
		}
	}
]

if (!is.macos) {
	helpSubmenu.push(
		{
			type: 'separator'
		},
		aboutMenuItem({
			icon: path.join(__dirname, 'static', 'icon.png'),
			text: 'Created by Lacy Morrow'
		})
	)
}

const debugSubmenu = [
	{
		label: 'Show Settings',
		click() {
			shell.openItem(this.path);
		}
	},
	{
		label: 'Show App Data',
		click() {
			shell.openItem(app.getPath('userData'))
		}
	},
	{
		type: 'separator'
	},
	{
		label: 'Delete Settings',
		click() {
			app.relaunch()
			app.quit()
		}
	},
	{
		label: 'Delete App Data',
		click() {
			shell.moveItemToTrash(app.getPath('userData'))
			app.relaunch()
			app.quit()
		}
	}
]

const macosTemplate = [
	appMenu([
		{
			label: 'Open at startup',
			type: 'checkbox',
			checked: false,
			click() {
				showBootLaunch()
			}
		},
		{
			label: 'Preferences…',
			accelerator: 'Command+,',
			click() {
				showPreferences()
			}
		}
	]),
	{
		role: 'fileMenu',
		submenu: [
			{
				type: 'separator'
			},
			{
				role: 'close'
			}
		]
	},
	{
		role: 'editMenu'
	},
	{
		role: 'viewMenu'
	},
	{
		role: 'windowMenu'
	},
	{
		role: 'help',
		submenu: helpSubmenu
	}
]

// Linux and Windows
const otherTemplate = [
	{
		role: 'fileMenu',
		submenu: [
			{
				label: 'Custom'
			},
			{
				type: 'separator'
			},
			{
				label: 'Settings',
				accelerator: 'Control+,',
				click() {
					showPreferences()
				}
			},
			{
				type: 'separator'
			},
			{
				role: 'quit'
			}
		]
	},
	{
		role: 'editMenu'
	},
	{
		role: 'viewMenu'
	},
	{
		role: 'help',
		submenu: helpSubmenu
	}
]

const template = process.platform === 'darwin' ? macosTemplate : otherTemplate

if (is.development) {
	template.push({
		label: 'Debug',
		submenu: debugSubmenu
	})
}

module.exports = Menu.buildFromTemplate(template)
