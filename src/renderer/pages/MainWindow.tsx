import { useGlobalContext } from '@/renderer/context/global-context';

type Props = {};

export function MainWindow(props: Props) {
	const context = useGlobalContext();

	return <div>Hello World</div>;
}
