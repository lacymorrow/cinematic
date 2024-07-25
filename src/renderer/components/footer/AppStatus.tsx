import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { GlobalContext } from '@/renderer/context/global-context';
import { simpleUUID } from '@/utils/getUUID';
import { useContext } from 'react';

function AppStatus() {
	const { message, messages } = useContext(GlobalContext);

	if (!message) return null;
	if (messages?.length < 2) return <>{message}</>;
	return (
		<Dialog>
			<DialogTrigger>{message}</DialogTrigger>
			<DialogContent className="sm:max-w-[425px] max-h-[60vh] overflow-auto">
				<DialogHeader>
					<DialogTitle>Application status log</DialogTitle>
					<DialogDescription>
						Viewing last {messages.length} messages from application processes
					</DialogDescription>
				</DialogHeader>
				{messages.map((m) => (
					<DialogDescription key={simpleUUID()}>{m}</DialogDescription>
				))}
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button">Close</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default AppStatus;
