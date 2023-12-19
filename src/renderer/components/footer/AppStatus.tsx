import { AppContext } from '@/renderer/context/app-context';
import { useContext } from 'react';

function AppStatus() {
	const { message } = useContext(AppContext);

	return <div>{message}</div>;
}

export default AppStatus;
