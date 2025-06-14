import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import * as z from "zod";

const companyInformationSchema = z.object({
	name: z.string().min(1, "Company name is required"),
	description: z.string().min(1, "Description is required"),
});

interface CompanyInformationFormProps {
	onUpdateData: (data: { name: string; description: string }) => void;
}

export const CompanyInformationForm = React.forwardRef<
	UseFormReturn<z.infer<typeof companyInformationSchema>>,
	CompanyInformationFormProps
>(({ onUpdateData }, ref) => {
	const form = useForm<z.infer<typeof companyInformationSchema>>({
		resolver: zodResolver(companyInformationSchema),
		defaultValues: {
			name: "",
			description: "",
		},
	});

	useImperativeHandle(ref, () => form, [form]);

	const onSubmit = (values: z.infer<typeof companyInformationSchema>) => {
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
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Company Name</FormLabel>
							<FormControl>
								<Input placeholder="Enter company name" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Textarea placeholder="Describe your company" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
});

CompanyInformationForm.displayName = "CompanyInformationForm";
