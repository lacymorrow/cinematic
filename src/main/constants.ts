import { app } from 'electron';
import os from 'os';

export const electronVersion = process.versions.electron;

export const debugInfo = () =>
	`
  ${app.getName()} ${app.getVersion()}
  Electron ${electronVersion}
  ${process.platform} ${os.release()}
  Locale: ${app.getLocale()}
  `.trim();
