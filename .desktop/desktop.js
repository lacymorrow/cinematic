'use strict'
import process from 'process';
import { app, dialog, ipcMain, globalShortcut, BrowserWindow, Menu } from 'electron';
import {autoUpdater} from 'electron-updater'
import {is} from 'electron-util'
import unhandled from 'electron-unhandled'
import debug from 'electron-debug'
import contextMenu from 'electron-context-menu'
import {config, defaults} from './config'
import menu from './menu'

unhandled()
debug()
contextMenu();

// Note: Must match `build.appId` in package.json
app.setAppUserModelId('com.lacymorrow.Cinematic')

// Uncomment this before publishing your first version.
// It's commented out as it throws an error if there are no published versions.
if (!is.development) {
	const FOUR_HOURS = 1000 * 60 * 60 * 4
	setInterval(() => {
		autoUpdater.checkForUpdates()
	}, FOUR_HOURS)

	autoUpdater.checkForUpdates()
}
/**
 * Entry point to your native desktop code.
 *
 * @class
 */
export default class Desktop {
    /**
     * @param {Object} log         - Winston logger instance
     * @param {Object} skeletonApp - reference to the skeleton app instance
     * @param {Object} appSettings - settings.json contents
     * @param {Object} eventsBus   - event emitter for listening or emitting events
     *                               shared across skeleton app and every module/plugin
     * @param {Object} modules     - references to all loaded modules
     * @param {Object} Module      - reference to the Module class
     * @constructor
     */
    constructor({
        log, skeletonApp, appSettings, eventsBus, modules, Module
    }) {
        /**
         * You can delete unused var from the param destructuring.
         * Left them here just to emphasize what is passed. Delete the eslint rule at the top
         * when done.
         * You can also just have a one `config` param and do `Object.assign(this, config);`
         */
        const desktop = new Module('desktop');
        // Get the automatically predefined logger instance.
        this.log = log;

        // From Meteor use this by invoking Desktop.send('desktop', 'closeApp');
        desktop.on('closeApp', () => app.quit());

        // We need to handle gracefully potential problems.
        // Lets remove the default handler and replace it with ours.
        skeletonApp.removeUncaughtExceptionListener();

        process.on('uncaughtException', Desktop.uncaughtExceptionHandler);

        // Chrome problems should also be handled. The `windowCreated` event has a `window`
        // reference. This is the reference to the current Electron renderer process (Chrome)
        // displaying your Meteor app.
        eventsBus.on('windowCreated', (window) => {
        	window.webContents.on('dom-ready', () => {
        	    // set perfect size
        	    // window.setSize(1300,768);
        	    // window.setFullScreen(true);
        	    // window.minimize();
        	    window.maximize();
        	});

            window.webContents.on('crashed', Desktop.windowCrashedHandler);
            window.on('unresponsive', Desktop.windowUnresponsiveHandler);

            Menu.setApplicationMenu(menu);

            /* IPC */

            desktop.on('load-settings', (args) => {
                desktop.cinematic_settings = args;
            });

            // https://stackoverflow.com/questions/44773029/how-to-select-file-or-folder-in-file-dialog
            // listen to an open-file-dialog command and sending back selected information
            desktop.on('open-file-dialog', () => {
                movieSelectDialog();
            });

            const movieSelectDialog = () => {
                dialog.showOpenDialog({
                    filters: [
                        { name: 'Movies', extensions: ['.avi', '.flv', '.mp4', '.m4v', '.mov', '.ogg', '.ogv', '.vob', '.wmv', '.mkv'] },
                        { name: 'All Files', extensions: ['*'] }
                    ],
                    title: 'Scan Movies',
                    message: 'Choose movie folder to scan:',
                    properties: ['openDirectory', 'openFile', 'multiSelections']
                }, function(files) {
                    if (files) {
                        desktop.send('selected-file', files)
                    } else {
                        desktop.send('selected-file', false)
                    }
                });

            }

        }); //  /eventsBus.on('windowCreated'

        // Consider setting a crash reporter ->
        // https://github.com/electron/electron/blob/master/docs/api/crash-reporter.md
    }

    /**
     * File browser handler.
     */
    static dialogLaunch() {
        Desktop.displayRestartDialog(
            'Cinematic has crashed unexpectedly',
            'Do you want to restart it?'
        );
    }

    /**
     * Window crash handler.
     */
    static windowCrashedHandler() {
        Desktop.displayRestartDialog(
            'Cinematic has crashed',
            'Do you want to restart it?'
        );
    }

    /**
     * Window's unresponsiveness handler.
     */
    static windowUnresponsiveHandler() {
        Desktop.displayRestartDialog(
            'Cinematic is not responding',
            'Do you want to restart it?'
        );
    }

    /**
     * JS's uncaught exception handler.
     * @param {string} error - error message
     */
    static uncaughtExceptionHandler(error) {
        // Consider sending a log somewhere, it is good be aware your users are having problems,
        // right?
        Desktop.displayRestartDialog(
            'Cinematic encountered an error',
            'Do you want to restart it?',
            error.message
        );
    }

    /**
     * Displays an error dialog with simple 'restart' or 'shutdown' choice.
     * @param {string} title   - title of the dialog
     * @param {string} message - message shown in the dialog
     * @param {string} details - additional details to be displayed
     */
    static displayRestartDialog(title, message, details = '') {
        dialog.showMessageBox(
            {
                type: 'error', buttons: ['Restart', 'Shutdown'], title, message, detail: details
            },
            (response) => {
                if (response === 0) {
                    app.relaunch();
                }
                app.exit(0);
            }
        );
    }
}
