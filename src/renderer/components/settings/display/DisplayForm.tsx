'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Checkbox } from '@/components/ui/checkbox';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import { useGlobalContext } from '@/renderer/context/global-context';

const sidebarItems = [
	{
		id: 'liked',
		label: 'Liked media',
	},
	{
		id: 'genres',
		label: 'Genres',
	},
	{
		id: 'playlists',
		label: 'Playlists',
	},
] as const;

const displayFormSchema = z.object({
	sidebarItems: z.array(z.string()),
});

type DisplayFormValues = z.infer<typeof displayFormSchema>;

export function DisplayForm() {
	const { settings, setSettings } = useGlobalContext();

	const defaultValues: Partial<DisplayFormValues> = {
		sidebarItems: settings.visibleSidebarElements,
	};

	const form = useForm<DisplayFormValues>({
		resolver: zodResolver(displayFormSchema),
		defaultValues,
	});

	function onSubmit(data: DisplayFormValues) {
		toast({
			title: 'You submitted the following values:',
			description: (
				<pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
					<code className="text-white">{JSON.stringify(data, null, 2)}</code>
				</pre>
			),
		});
	}

	const handleSidebarChange = (e: string[]) => {
		setSettings({
			visibleSidebarElements: e,
		});
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-8"
				onChange={() => handleSidebarChange(form.getValues('sidebarItems'))}
			>
				<FormField
					control={form.control}
					name="sidebarItems"
					render={() => (
						<FormItem>
							<div className="mb-4">
								<FormLabel className="text-base">User Interface</FormLabel>
								<FormDescription>
									Show or hide sidebarItems in the application interface.
								</FormDescription>
							</div>
							{sidebarItems.map((item) => (
								<FormField
									key={item.id}
									control={form.control}
									name="sidebarItems"
									render={({ field }) => {
										return (
											<FormItem
												key={item.id}
												className="flex flex-row items-start space-x-3 space-y-0"
											>
												<FormControl>
													<Checkbox
														checked={field.value?.includes(item.id)}
														onCheckedChange={(checked) => {
															return checked
																? field.onChange([...field.value, item.id])
																: field.onChange(
																		field.value?.filter(
																			(value) => value !== item.id,
																		),
																  );
														}}
													/>
												</FormControl>
												<FormLabel className="font-normal">
													{item.label}
												</FormLabel>
											</FormItem>
										);
									}}
								/>
							))}
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="sidebarItems"
					render={() => (
						<FormItem>
							<div className="mb-4">
								<FormLabel className="text-base">Sidebar</FormLabel>
								<FormDescription>
									Select the sidebarItems you want to display in the sidebar.
								</FormDescription>
							</div>
							{sidebarItems.map((item) => (
								<FormField
									key={item.id}
									control={form.control}
									name="sidebarItems"
									render={({ field }) => {
										return (
											<FormItem
												key={item.id}
												className="flex flex-row sidebarItems-start space-x-3 space-y-0"
											>
												<FormControl>
													<Checkbox
														checked={field.value?.includes(item.id)}
														onCheckedChange={(checked) => {
															return checked
																? field.onChange([...field.value, item.id])
																: field.onChange(
																		field.value?.filter(
																			(value) => value !== item.id,
																		),
																  );
														}}
													/>
												</FormControl>
												<FormLabel className="font-normal">
													{item.label}
												</FormLabel>
											</FormItem>
										);
									}}
								/>
							))}
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
}
