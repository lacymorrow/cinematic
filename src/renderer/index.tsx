import { Layout } from '@/renderer/components/layout/Layout';
import App from '@/renderer/windows/main/App';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
	<Layout>
		<App />
	</Layout>,
);
