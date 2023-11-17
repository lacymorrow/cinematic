import { CardGithub } from './CardGithub';
import { CardNotifications } from './CardNotification';

export default function SettingsAbout() {
  return (
    <div className="space-y-6">
      <CardGithub />
      <CardNotifications />
    </div>
  );
}
