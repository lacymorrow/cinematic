import { cn } from '@/lib/utils';
import React, { useEffect } from 'react';

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
} from '@/components/ui/form';

const FormSchema = z.object({
	checkboxValue: z.boolean().default(false).optional(),
});

export function InputCheckbox({
	value,
	onChange,
	label,
	description,
	details,
	content,
	card,
}: {
	value?: boolean;
	onChange?: (value: boolean) => void;
	label?: string;
	description?: string;
	details?: string;
	content?: React.ReactNode;
	card?: boolean;
}) {
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			checkboxValue: value ?? false,
		},
	});

	function onSubmit(data: z.infer<typeof FormSchema>) {
		onChange?.(data.checkboxValue ?? false);
	}

	useEffect(() => {
		form.setValue('checkboxValue', value);
	}, [form, value]);

	return (
		<Form {...form}>
			<form onChange={form.handleSubmit(onSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="checkboxValue"
					render={({ field }) => (
						<FormItem
							className={cn(
								'flex flex-row items-start space-x-3 space-y-0',
								card && 'rounded-md border p-4',
							)}
						>
							<FormControl>
								<Checkbox
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
							<div className="space-y-1 leading-none">
								{label && <FormLabel>{label}</FormLabel>}
								{description && (
									<FormDescription>{description}</FormDescription>
								)}
							</div>
						</FormItem>
					)}
				/>
			</form>
			{details && <p className="text-sm text-muted-foreground">{details}</p>}
			{content && <div>{content}</div>}
		</Form>
	);
}
