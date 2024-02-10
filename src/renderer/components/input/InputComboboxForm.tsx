'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import React from 'react';

import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from '@/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';

const FormSchema = z.object({
	itemValue: z.string({
		required_error: 'Please select a language.',
	}),
});
export function InputComboboxForm({
	items,
	value,
	onChange,
	label,
	description,
	placeholder,
	searchMessage,
	noValueMessage,
	details,
	content,
}: {
	items: { value: string; label: string }[];
	value?: string;
	onChange?: (value: string) => void;
	label?: string;
	description?: string;
	placeholder?: string;
	searchMessage?: string;
	noValueMessage?: string;
	details?: string;
	content?: React.ReactNode;
}) {
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			itemValue: value ?? '',
		},
	});

	function onSubmit(data: z.infer<typeof FormSchema>) {
		onChange?.(data.itemValue);
	}

	return (
		<Form {...form}>
			<form className="space-y-6">
				<FormField
					control={form.control}
					name="itemValue"
					render={({ field }) => {
						const currentValue = value ?? field.value;
						return (
							<FormItem className="flex flex-col">
								{label && <FormLabel>{label}</FormLabel>}
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant="outline"
												role="combobox"
												className={cn(
													'w-[200px] justify-between',
													!currentValue && 'text-muted-foreground',
												)}
											>
												{currentValue
													? items.find((item) => item.value === currentValue)
															?.label
													: placeholder || 'Select...'}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-[200px] p-0">
										<Command>
											<CommandInput
												placeholder={searchMessage || 'Search...'}
											/>
											<CommandEmpty>
												{noValueMessage || 'No language found.'}
											</CommandEmpty>
											<CommandGroup>
												{items.map((item) => (
													<CommandItem
														value={item.label}
														key={item.value}
														onSelect={() => {
															form.setValue('itemValue', item.value);
															onSubmit({ itemValue: item.value });
														}}
													>
														<Check
															className={cn(
																'mr-2 h-4 w-4',
																item.value === currentValue
																	? 'opacity-100'
																	: 'opacity-0',
															)}
														/>
														{item.label}
													</CommandItem>
												))}
											</CommandGroup>
										</Command>
									</PopoverContent>
								</Popover>
								{description && (
									<FormDescription>{description}</FormDescription>
								)}
								<FormMessage />
							</FormItem>
						);
					}}
				/>
			</form>
			{details && <p className="text-sm text-muted-foreground">{details}</p>}
			{content && <div>{content}</div>}
		</Form>
	);
}
