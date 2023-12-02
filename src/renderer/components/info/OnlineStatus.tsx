import { $messages } from '@/config/strings';
import isOnline from 'is-online';
import { WifiIcon, WifiOffIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

const twclasses = 'w-4 h-4 inline-block -mt-1 mr-1';

function OnlineStatus() {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const checkOnlineStatus = async () => {
      const isUserOnline = await isOnline();
      setOnline(isUserOnline);
    };

    window.addEventListener('offline', checkOnlineStatus);
    window.addEventListener('online', checkOnlineStatus);

    checkOnlineStatus();
    return () => {
      window.removeEventListener('offline', checkOnlineStatus);
      window.removeEventListener('online', checkOnlineStatus);
    };
  }, []);

  return (
    <div>
      {online ? (
        <div>
          <WifiIcon className={twclasses} />
          {$messages.online}
        </div>
      ) : (
        <div>
          <WifiOffIcon className={twclasses} />
          {$messages.offline}
        </div>
      )}
    </div>
  );
}

export default OnlineStatus;
