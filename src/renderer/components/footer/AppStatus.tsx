import { GlobalContext } from '@/renderer/context/global-context';
import { useContext } from 'react';

function AppStatus() {
	const { message } = useContext(GlobalContext);

	return <div>{message}</div>;
}

export default AppStatus;
