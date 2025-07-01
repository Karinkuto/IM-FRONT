import { Info } from "lucide-react";
import * as z from "zod";
import { SmartForm, SmartFormField } from "@/components/smart-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const userFormSchema = z.object({
	email: z.string().email("Invalid email address"),
	phone_number: z.string().optional(),
	role: z.enum(["admin", "customer", "insurer"]).optional(), // role only for create
});

type UserFormValues = z.infer<typeof userFormSchema>;

type Mode = "create" | "edit";

interface UserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (values: UserFormValues) => Promise<any>;
	isLoading?: boolean;
	mode?: Mode;
	initialValues?: Partial<UserFormValues>;
	userId?: string | number;
}

export default function UserDialog({
	open,
	onOpenChange,
	onSubmit,
	isLoading,
	mode = "create",
	initialValues,
}: UserDialogProps) {
	const leftSection = (
		<div className="bg-muted/50 p-6 rounded-lg h-full">
			<div className="space-y-4">
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-full bg-primary/10">
						<Info className="h-5 w-5 text-primary" />
					</div>
					<h3 className="font-semibold">
						{mode === "edit" ? "Edit User" : "Add New User"}
					</h3>
				</div>
				<p className="text-sm text-muted-foreground">
					{mode === "edit"
						? "Update the user's details. Only email and phone number can be changed."
						: "Fill in the user details to add a new user. All fields are required for proper account setup."}
				</p>
				<div className="space-y-2 pt-4">
					<h4 className="text-sm font-medium">Tips:</h4>
					<ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
						<li>Provide a valid email address for the user</li>
						{mode === "create" && (
							<li>Assign the correct role (admin, customer, insurer)</li>
						)}
					</ul>
				</div>
			</div>
		</div>
	);
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
				<div className="grid grid-cols-12 gap-6">
					<div className="col-span-4">{leftSection}</div>
					<div className="col-span-8">
						<SmartForm
							schema={userFormSchema}
							mutationFn={onSubmit}
							mode={mode}
							defaultValues={
								initialValues || {
									email: "",
									phone_number: "",
									role: "customer",
								}
							}
							submitText={mode === "edit" ? "Save Changes" : "Add User"}
							onSuccess={() => onOpenChange(false)}
							card={false}
						>
							{(form) => (
								<>
									<SmartFormField
										form={form}
										name="email"
										type="email"
										label="Email"
										placeholder="Enter email..."
									/>
									<SmartFormField
										form={form}
										name="phone_number"
										type="text"
										label="Phone Number"
										placeholder="Enter phone number..."
									/>
									{mode === "create" && (
										<SmartFormField
											form={form}
											name="role"
											type="select"
											label="Role"
											options={[
												{ value: "admin", label: "Admin" },
												{ value: "customer", label: "Customer" },
												{ value: "insurer", label: "Insurer" },
											]}
											placeholder="Select role"
										/>
									)}
								</>
							)}
						</SmartForm>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
