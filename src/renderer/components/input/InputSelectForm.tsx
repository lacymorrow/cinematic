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
	FormMessage,
} from '@/components/ui/form';
import React from 'react';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

export function InputSelectForm({
	items,
	value,
	onChange,
	label,
	description,
	placeholder,
	details,
	content,
}: {
	items: { value: string; label: string }[];
	value?: string;
	onChange?: (value: string) => void;
	label?: string;
	description?: string;
	placeholder?: string;
	details?: string;
	content?: React.ReactNode;
}) {
	const FormSchema = z.object({
		item: z.string(),
	});

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			item: value ?? '',
		},
	});

	function onSubmit(data: z.infer<typeof FormSchema>) {
		onChange?.(data.item);
	}

	const handleChange = (val: string) => {
		onChange?.(val);
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="min-w-xs space-y-6"
			>
				<div>
					<h3 className="text-lg font-medium">{label}</h3>

					<FormField
						control={form.control}
						name="item"
						render={({ field }) => (
							<FormItem>
								{description && (
									<FormDescription>{description}</FormDescription>
								)}
								<Select
									onValueChange={(val) => {
										handleChange(val);
										field.onChange(val);
									}}
									value={value || field.value}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue
												placeholder={placeholder || 'Select an item'}
											/>
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{items.map((item) => (
											<SelectItem key={item.value} value={item.value}>
												{item.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{details && <FormDescription>{details}</FormDescription>}
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</form>

			{content && <div>{content}</div>}
		</Form>
	);
}
