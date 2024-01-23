import { Layout } from '@/renderer/components/layout/Layout';
import { useGlobalContext } from '@/renderer/context/global-context';
import '@/renderer/styles/globals.scss';

export default function ChildApp() {
	const { settings } = useGlobalContext();

	return (
		<Layout>
			<pre>{JSON.stringify(settings, null, 2)}</pre>
		</Layout>
	);
}
