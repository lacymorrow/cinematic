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
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import React from 'react';

export function InputSwitchForm({
	items,
	value,
	onChange,
	label,
	description,
	details,
	content,
}: {
	items: { value: string; label: string; description?: string }[];
	value?: string[];
	onChange?: (value: string[]) => void;
	label?: string;
	description?: string;
	details?: string;
	content?: React.ReactNode;
}) {
	const FormSchema = z.object({
		items: z.array(z.string()),
	});

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
			<form onChange={form.handleSubmit(onSubmit)} className="space-y-6">
				<div>
					<h3 className="text-lg font-medium">{label}</h3>
					<p className="text-sm text-muted-foreground mb-4">{description}</p>
					<div className="space-y-4">
						<FormField
							control={form.control}
							name="items"
							render={() => (
								<FormItem className={cn()}>
									<div className="space-y-4">
										{items.map((item) => (
											<FormField
												key={item.value}
												control={form.control}
												name="items"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
														<div className="space-y-0.5">
															<FormLabel className="text-base">
																{item.label}
															</FormLabel>
															<FormDescription>
																{item.description}
															</FormDescription>
														</div>
														<FormControl>
															<Switch
																checked={field.value.includes(item.value)}
																onCheckedChange={(checked) => {
																	if (checked) {
																		form.setValue('items', [
																			...field.value,
																			item.value,
																		]);
																	} else {
																		form.setValue(
																			'items',
																			field.value.filter(
																				(i) => i !== item.value,
																			),
																		);
																	}
																}}
															/>
														</FormControl>
													</FormItem>
												)}
											/>
										))}
									</div>
								</FormItem>
							)}
						/>
					</div>
				</div>
			</form>
			{details && <p className="text-sm text-muted-foreground">{details}</p>}
			{content && <div>{content}</div>}
		</Form>
	);
}
