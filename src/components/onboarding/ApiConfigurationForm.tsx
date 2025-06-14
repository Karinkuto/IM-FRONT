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

const apiConfigurationSchema = z.object({
	api_endpoint: z.string().url("Invalid URL"),
	api_key: z.string().min(1, "API key is required"),
});

interface ApiConfigurationFormProps {
	onUpdateData: (data: { api_endpoint: string; api_key: string }) => void;
}

export const ApiConfigurationForm = React.forwardRef<
	UseFormReturn<z.infer<typeof apiConfigurationSchema>>,
	ApiConfigurationFormProps
>(({ onUpdateData }, ref) => {
	const form = useForm<z.infer<typeof apiConfigurationSchema>>({
		resolver: zodResolver(apiConfigurationSchema),
		defaultValues: {
			api_endpoint: "",
			api_key: "",
		},
	});

	useImperativeHandle(ref, () => form, [form]);

	const onSubmit = (values: z.infer<typeof apiConfigurationSchema>) => {
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
					name="api_endpoint"
					render={({ field }) => (
						<FormItem>
							<FormLabel>API Endpoint</FormLabel>
							<FormControl>
								<Input placeholder="https://your-api.com" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="api_key"
					render={({ field }) => (
						<FormItem>
							<FormLabel>API Key</FormLabel>
							<FormControl>
								<Input
									type="password"
									placeholder="****************"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
});

ApiConfigurationForm.displayName = "ApiConfigurationForm";
