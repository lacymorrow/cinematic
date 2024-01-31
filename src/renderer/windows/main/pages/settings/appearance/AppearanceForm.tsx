import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { $settings } from '@/config/strings';

import { buttonVariants } from '@/components/ui/button';
import { ThemeType } from '@/config/settings';
import { cn } from '@/lib/utils';
import { useTheme } from '@/renderer/context/theme-context';
import { toast } from 'sonner';

const appearanceFormSchema = z.object({
	theme: z.enum(['light', 'dark', 'system'], {
		required_error: 'Please select a theme.',
	}),
});

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

export function AppearanceForm() {
	const { theme, setTheme } = useTheme();

	const defaultValues: Partial<AppearanceFormValues> = {
		theme,
	};

	const form = useForm<AppearanceFormValues>({
		resolver: zodResolver(appearanceFormSchema),
		defaultValues,
	});

	const onThemeChange = (e: ThemeType) => {
		setTheme(e);
	};

	function onSubmit(data: AppearanceFormValues) {
		toast('You submitted the following values:', {
			description: (
				<pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
					<code className="text-white">{JSON.stringify(data, null, 2)}</code>
				</pre>
			),
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="theme"
					render={({ field }) => (
						<FormItem className="space-y-1">
							<FormLabel>{$settings.appearance.themeLabel}</FormLabel>
							<FormDescription>
								{$settings.appearance.themeDescription}
							</FormDescription>
							<FormMessage />
							<RadioGroup
								onValueChange={(e: ThemeType) => {
									onThemeChange(e);
									field.onChange(e);
								}}
								defaultValue={field.value}
								className="grid max-w-md grid-cols-2 gap-8 pt-2"
							>
								<FormItem>
									<FormLabel className="[&:has([data-state=checked])>div]:border-primary">
										<FormControl>
											<RadioGroupItem value="light" className="sr-only" />
										</FormControl>
										<div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
											<div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
												<div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
													<div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
													<div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
												</div>
												<div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
													<div className="h-4 w-4 rounded-full bg-[#ecedef]" />
													<div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
												</div>
												<div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
													<div className="h-4 w-4 rounded-full bg-[#ecedef]" />
													<div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
												</div>
											</div>
										</div>
										<span className="block w-full p-2 text-center font-normal">
											{$settings.appearance.light}
										</span>
									</FormLabel>
								</FormItem>
								<FormItem>
									<FormLabel className="[&:has([data-state=checked])>div]:border-primary">
										<FormControl>
											<RadioGroupItem value="dark" className="sr-only" />
										</FormControl>
										<div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
											<div className="space-y-2 rounded-sm bg-slate-950 p-2">
												<div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
													<div className="h-2 w-[80px] rounded-lg bg-slate-400" />
													<div className="h-2 w-[100px] rounded-lg bg-slate-400" />
												</div>
												<div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
													<div className="h-4 w-4 rounded-full bg-slate-400" />
													<div className="h-2 w-[100px] rounded-lg bg-slate-400" />
												</div>
												<div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
													<div className="h-4 w-4 rounded-full bg-slate-400" />
													<div className="h-2 w-[100px] rounded-lg bg-slate-400" />
												</div>
											</div>
										</div>
										<span className="block w-full p-2 text-center font-normal">
											{$settings.appearance.dark}
										</span>
									</FormLabel>
								</FormItem>
								<FormItem>
									<FormLabel className="[&:has([data-state=checked])>div]:border-primary">
										<FormControl>
											<RadioGroupItem value="system" className="sr-only" />
										</FormControl>
										<div>
											<span
												className={cn(
													'inline-block',
													buttonVariants({
														variant: 'link',
													}),
													theme === 'system' && 'underline',
												)}
											>
												Use the system settings
											</span>
										</div>
									</FormLabel>
								</FormItem>
							</RadioGroup>
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
}
