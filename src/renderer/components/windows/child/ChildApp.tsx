import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGlobalContext } from '@/renderer/context/global-context';
import '@/renderer/styles/globals.scss';

// Component to display a single setting
function SettingItem({ name, value }: { name: string; value: any }) {
	return (
		<div className="flex justify-between items-center py-3 border-b last:border-b-0">
			<span className="font-medium">{name}</span>
			<Badge
				variant={
					typeof value === 'boolean'
						? value
							? 'success'
							: 'destructive'
						: 'default'
				}
			>
				{value.toString()}
			</Badge>
		</div>
	);
}

function ChildApp() {
	const { settings } = useGlobalContext();

	return (
		<div className="p-6 h-screen bg-gradient-to-br from-background to-secondary/10 text-foreground flex items-center justify-center">
			<Card className="w-full max-w-2xl mx-auto shadow-lg">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold">
						Application Settings
					</CardTitle>
					<CardDescription>
						View and manage your application settings. These settings affect
						various aspects of the application's behavior and appearance.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ScrollArea className="h-[60vh] pr-4">
						<div className="space-y-2">
							{Object.entries(settings).map(([key, value]) => (
								<SettingItem key={key} name={key} value={value} />
							))}
						</div>
					</ScrollArea>
				</CardContent>
			</Card>
		</div>
	);
}

export default ChildApp;
