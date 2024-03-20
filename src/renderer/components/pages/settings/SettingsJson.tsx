import { useGlobalContext } from '@/renderer/context/global-context';

export function SettingsJson() {
	const { settings } = useGlobalContext();

	return <pre>{JSON.stringify(settings, null, 2)}</pre>;
}
