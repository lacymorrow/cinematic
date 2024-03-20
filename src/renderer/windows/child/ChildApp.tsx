import { useGlobalContext } from '@/renderer/context/global-context';
import '@/renderer/styles/globals.scss';

export default function ChildApp() {
	const { settings } = useGlobalContext();

	return <pre>{JSON.stringify(settings, null, 2)}</pre>;
}
