import { StatusMessageContext } from '@/renderer/context/status-message-context';
import { useContext } from 'react';

function AppStatus() {
	const { message } = useContext(StatusMessageContext);

	return <div>{message}</div>;
}

export default AppStatus;
