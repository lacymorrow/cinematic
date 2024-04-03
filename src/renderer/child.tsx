import { Layout } from '@/renderer/components/layout/Layout';
import App from '@/renderer/components/windows/child/ChildApp';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
	<Layout>
		<App />
	</Layout>,
);
