import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
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
import { PlusCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	// No password fields needed as we'll use temporary password for insurers
});

interface CreateUserDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onUserCreate: (values: {
		email: string;
		role: string;
	}) => Promise<boolean>;
}

export const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
	isOpen,
	onOpenChange,
	onUserCreate,
}) => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	const resetFormFields = () => {
		form.reset({
			email: "",
		});
	};

	const [isSubmitting, setIsSubmitting] = useState(false);

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			setIsSubmitting(true);
			// Always create insurer user with temporary password
			const userData = {
				email: values.email,
				role: "insurer",
			};

			const success = await onUserCreate(userData);
			if (success) {
				resetFormFields();
				onOpenChange(false);
			}
		} catch (error) {
			console.error("Error creating insurer user:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(openState) => {
				onOpenChange(openState);
				if (!openState) resetFormFields();
			}}
		>
			<DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<div className="grid grid-cols-12 gap-6">
							{/* Left Column - Description */}
							<div className="col-span-4 bg-muted/50 p-6 rounded-lg">
								<div className="space-y-4">
									<div className="flex items-center gap-3">
										<div className="p-2 rounded-full bg-primary/10">
											<ShieldCheck className="h-5 w-5 text-primary" />
										</div>
										<h3 className="font-semibold">Create New User</h3>
									</div>
									<p className="text-sm text-muted-foreground">
										Create a new insurer account. A temporary password will be
										automatically generated and sent to the provided email
										address.
									</p>
									<div className="space-y-2 pt-4">
										<h4 className="text-sm font-medium">What happens next:</h4>
										<ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
											<li>
												The insurer will receive a welcome email with login
												instructions
											</li>
											<li>
												They'll be prompted to set a new password on first login
											</li>
											<li>They'll have access to the insurer dashboard</li>
										</ul>
									</div>
								</div>
							</div>

							{/* Right Column - Form */}
							<div className="col-span-8 flex flex-col justify-between">
								<div className="space-y-4 p-6">
									{/* Email */}
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email</FormLabel>
												<FormControl>
													<Input
														placeholder="user@example.com"
														type="email"
														autoComplete="username"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="text-sm text-muted-foreground bg-muted/10 border border-muted/20 p-4 rounded-md">
										<p className="font-medium text-foreground">
											Insurer Account
										</p>
										<p className="mt-1">
											A temporary password will be generated and sent to the
											user's email address. They'll be required to set a new
											password on first login.
										</p>
									</div>
								</div>

								<DialogFooter className="pt-4">
									<Button
										type="button"
										variant="outline"
										onClick={() => onOpenChange(false)}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={isSubmitting}>
										<PlusCircle className="mr-2 h-4 w-4" />
										{isSubmitting ? "Creating..." : "Create User"}
									</Button>
								</DialogFooter>
							</div>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
