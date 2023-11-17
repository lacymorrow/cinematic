import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

export class AutoUpdate {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;

    autoUpdater.checkForUpdatesAndNotify();
  }
}

export const install = () => autoUpdater.quitAndInstall();
