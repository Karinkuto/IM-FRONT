import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import * as z from "zod";

const contactDetailsSchema = z.object({
	contact_email: z.string().email("Invalid email address"),
	contact_phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

interface ContactDetailsFormProps {
	onUpdateData: (data: {
		contact_email: string;
		contact_phone: string;
	}) => void;
}

export const ContactDetailsForm = React.forwardRef<
	UseFormReturn<z.infer<typeof contactDetailsSchema>>,
	ContactDetailsFormProps
>(({ onUpdateData }, ref) => {
	const form = useForm<z.infer<typeof contactDetailsSchema>>({
		resolver: zodResolver(contactDetailsSchema),
		defaultValues: {
			contact_email: "",
			contact_phone: "",
		},
	});

	useImperativeHandle(ref, () => form, [form]);

	const onSubmit = (values: z.infer<typeof contactDetailsSchema>) => {
		onUpdateData(values);
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4 max-w-sm mx-auto"
			>
				<FormField
					control={form.control}
					name="contact_email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Contact Email</FormLabel>
							<FormControl>
								<Input
									type="email"
									placeholder="email@example.com"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="contact_phone"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Contact Phone</FormLabel>
							<FormControl>
								<Input placeholder="e.g., +251912345678" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
});

ContactDetailsForm.displayName = "ContactDetailsForm";
