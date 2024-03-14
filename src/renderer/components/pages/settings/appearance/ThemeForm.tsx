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

import { ThemeType } from '@/config/settings';
import { cn } from '@/lib/utils';
import { useTheme } from '@/renderer/context/theme-context';

const appearanceFormSchema = z.object({
	theme: z.enum(['light', 'dark', 'system'], {
		required_error: 'Please select a theme.',
	}),
});

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

function LightModeIcon() {
	return (
		<>
			<div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
				<div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
					<div className="h-2 sm:w-[80px] rounded-lg bg-[#ecedef]" />
					<div className="h-2 sm:w-[100px] rounded-lg bg-[#ecedef]" />
				</div>
				<div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
					<div className="h-4 w-4 rounded-full bg-[#ecedef]" />
					<div className="h-2 sm:w-[100px] rounded-lg bg-[#ecedef]" />
				</div>
				<div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
					<div className="h-4 w-4 rounded-full bg-[#ecedef]" />
					<div className="h-2 sm:w-[100px] rounded-lg bg-[#ecedef]" />
				</div>
			</div>
		</>
	);
}

function DarkModeIcon() {
	return (
		<>
			<div className="space-y-2 rounded-sm bg-slate-950 p-2">
				<div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
					<div className="h-2 sm:w-[80px] rounded-lg bg-slate-400" />
					<div className="h-2 sm:w-[100px] rounded-lg bg-slate-400" />
				</div>
				<div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
					<div className="h-4 w-4 rounded-full bg-slate-400" />
					<div className="h-2 sm:w-[100px] rounded-lg bg-slate-400" />
				</div>
				<div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
					<div className="h-4 w-4 rounded-full bg-slate-400" />
					<div className="h-2 sm:w-[100px] rounded-lg bg-slate-400" />
				</div>
			</div>
		</>
	);
}

function SystemModeIcon() {
	return (
		<div className="relative overflow-hidden">
			<div className="">
				<LightModeIcon />
			</div>
			<div className="top-0 left-1/2 sm:w-full absolute z-10">
				<DarkModeIcon />
			</div>
		</div>
	);
}

export function ThemeForm() {
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

	return (
		<Form {...form}>
			<form className="space-y-8">
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
									field.onChange(e);
									onThemeChange(e);
								}}
								defaultValue={field.value}
								className="grid w-full grid-cols-3 gap-8 pt-2"
							>
								<FormItem>
									<FormLabel className="[&:has([data-state=checked])>div]:border-primary">
										<FormControl>
											<RadioGroupItem value="light" className="sr-only" />
										</FormControl>

										<div
											className={cn(
												'items-center rounded-md border-2 border-muted bg-popover p-1',
												theme !== 'light' &&
													'hover:bg-accent hover:text-accent-foreground',
											)}
										>
											<LightModeIcon />
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

										<div
											className={cn(
												'items-center rounded-md border-2 border-muted bg-popover p-1',
												theme !== 'dark' &&
													'hover:bg-accent hover:text-accent-foreground',
											)}
										>
											<DarkModeIcon />
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

										<div
											className={cn(
												'items-center rounded-md border-2 border-muted bg-popover p-1',
												theme !== 'system' &&
													'hover:bg-accent hover:text-accent-foreground',
											)}
										>
											<SystemModeIcon />
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
