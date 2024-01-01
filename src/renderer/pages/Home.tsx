import { useGlobalContext } from '@/renderer/context/global-context';
import { Link } from 'react-router-dom';

type Props = {};

export function Home(props: Props) {
	const context = useGlobalContext();

	return (
		<div>
			<h1>Hello World</h1>
			<Link to="/settings">Settings</Link>
		</div>
	);
}
