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

const passwordResetSchema = z
	.object({
		new_password: z.string().min(8, "Password must be at least 8 characters"),
		confirm_new_password: z.string(),
	})
	.refine((data) => data.new_password === data.confirm_new_password, {
		message: "Passwords don't match",
		path: ["confirm_new_password"],
	});

interface PasswordResetFormProps {
	onUpdateData: (data: { password_reset_required: boolean }) => void;
}

export const PasswordResetForm = React.forwardRef<
	UseFormReturn<z.infer<typeof passwordResetSchema>>,
	PasswordResetFormProps
>(({ onUpdateData }, ref) => {
	const form = useForm<z.infer<typeof passwordResetSchema>>({
		resolver: zodResolver(passwordResetSchema),
		defaultValues: {
			new_password: "",
			confirm_new_password: "",
		},
	});

	useImperativeHandle(ref, () => form, [form]);

	const onSubmit = (values: z.infer<typeof passwordResetSchema>) => {
		onUpdateData({ password_reset_required: false });
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4 max-w-sm mx-auto"
			>
				<FormField
					control={form.control}
					name="new_password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>New Password</FormLabel>
							<FormControl>
								<Input type="password" placeholder="********" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="confirm_new_password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Confirm New Password</FormLabel>
							<FormControl>
								<Input type="password" placeholder="********" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
});

PasswordResetForm.displayName = "PasswordResetForm";
