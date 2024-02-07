import React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
import { cn } from '@/lib/utils';

const FormSchema = z.object({
	items: z.array(z.string()).refine((value) => value.some((item) => item), {
		message: 'You have to select at least one item.',
	}),
});

export function InputCheckboxGroup({
	items,
	value,
	onChange,
	label,
	description,
	details,
	content,
	card,
}: {
	items: { value: string; label: string }[];
	value?: string[];
	onChange?: (value: string[]) => void;
	label?: string;
	description?: string;
	details?: string;
	content?: React.ReactNode;
	card?: boolean;
}) {
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			items: value ?? [],
		},
	});

	function onSubmit(data: z.infer<typeof FormSchema>) {
		onChange?.(data.items);
	}

	return (
		<Form {...form}>
			<form onChange={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="items"
					render={() => (
						<FormItem className={cn(card && 'rounded-md border p-4')}>
							<div className="mb-4">
								<FormLabel className="text-base">{label}</FormLabel>
								<FormDescription>{description}</FormDescription>
							</div>
							{items.map((item) => (
								<FormField
									key={item.value}
									control={form.control}
									name="items"
									render={({ field }) => {
										return (
											<FormItem
												key={item.value}
												className="flex flex-row items-start space-x-3 space-y-0"
											>
												<FormControl>
													<Checkbox
														checked={field.value?.includes(item.value)}
														onCheckedChange={(checked) => {
															return checked
																? field.onChange([...field.value, item.value])
																: field.onChange(
																		field.value?.filter(
																			(val) => val !== item.value,
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
			{details && <p className="text-sm text-muted-foreground">{details}</p>}
			{content && <div>{content}</div>}
		</Form>
	);
}
