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
	mode?: Mode;
	initialValues?: Partial<UserFormValues>;
	userId?: string | number;
}

export default function UserDialog({
	open,
	onOpenChange,
	onSubmit,
	mode = "create",
	initialValues,
}: UserDialogProps) {
	const leftSection = (
		<div className="h-full rounded-lg bg-muted/50 p-6">
			<div className="space-y-4">
				<div className="flex items-center gap-3">
					<div className="rounded-full bg-primary/10 p-2">
						<Info className="h-5 w-5 text-primary" />
					</div>
					<h3 className="font-semibold">
						{mode === "edit" ? "Edit User" : "Add New User"}
					</h3>
				</div>
				<p className="text-muted-foreground text-sm">
					{mode === "edit"
						? "Update the user's details. Only email and phone number can be changed."
						: "Fill in the user details to add a new user. All fields are required for proper account setup."}
				</p>
				<div className="space-y-2 pt-4">
					<h4 className="font-medium text-sm">Tips:</h4>
					<ul className="list-disc space-y-2 pl-4 text-muted-foreground text-sm">
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
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[800px]">
				<div className="grid grid-cols-12 gap-6">
					<div className="col-span-4">{leftSection}</div>
					<div className="col-span-8">
						<SmartForm
							card={false}
							defaultValues={
								initialValues || {
									email: "",
									phone_number: "",
									role: "customer",
								}
							}
							mode={mode}
							mutationFn={onSubmit}
							onSuccess={() => onOpenChange(false)}
							schema={userFormSchema}
							submitText={mode === "edit" ? "Save Changes" : "Add User"}
						>
							{(form) => (
								<>
									<SmartFormField
										form={form}
										label="Email"
										name="email"
										placeholder="Enter email..."
										type="email"
									/>
									<SmartFormField
										form={form}
										label="Phone Number"
										name="phone_number"
										placeholder="Enter phone number..."
										type="text"
									/>
									{mode === "create" && (
										<SmartFormField
											form={form}
											label="Role"
											name="role"
											options={[
												{ value: "admin", label: "Admin" },
												{ value: "customer", label: "Customer" },
												{ value: "insurer", label: "Insurer" },
											]}
											placeholder="Select role"
											type="select"
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
