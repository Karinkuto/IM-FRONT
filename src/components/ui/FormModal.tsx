import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
	type DefaultValues,
	type FieldValues,
	type UseFormReturn,
	useForm,
} from "react-hook-form";
import type { ZodSchema } from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";

export interface FormModalProps<T extends FieldValues> {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (values: T) => void;
	initialValues?: Partial<T>;
	validationSchema: ZodSchema<T>;
	isLoading?: boolean;
	mode?: "create" | "edit";
	title?: string;
	description?: string;
	leftSection?: React.ReactNode;
	renderFields: (form: UseFormReturn<T>) => React.ReactNode;
	submitLabel?: string;
	cancelLabel?: string;
	showFooter?: boolean;
}

export function FormModal<T extends FieldValues>({
	open,
	onOpenChange,
	onSubmit,
	initialValues,
	validationSchema,
	isLoading,
	mode = "create",
	title,
	description,
	leftSection,
	renderFields,
	submitLabel,
	cancelLabel = "Cancel",
	showFooter = true,
}: FormModalProps<T>) {
	const form = useForm<T>({
		resolver: zodResolver(validationSchema as ZodSchema<T>),
		defaultValues: initialValues as DefaultValues<T>,
		mode: "onChange",
	});

	// Reset form when initialValues change
	useEffect(() => {
		if (initialValues) {
			form.reset(initialValues as T);
		}
	}, [initialValues, form]);

	const handleSubmit = form.handleSubmit((values) => {
		onSubmit(values as unknown as T);
	});

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[800px]">
				<Form {...form}>
					<form className="space-y-6" onSubmit={handleSubmit}>
						<DialogHeader>
							{title && <DialogTitle>{title}</DialogTitle>}
							{description && (
								<DialogDescription>{description}</DialogDescription>
							)}
						</DialogHeader>
						<div className="grid grid-cols-12 gap-6">
							{leftSection && <div className="col-span-4">{leftSection}</div>}
							<div
								className={
									leftSection
										? "col-span-8 flex flex-col justify-between"
										: "col-span-12"
								}
							>
								{renderFields(form as UseFormReturn<T>)}
								{showFooter && (
									<DialogFooter className="mt-6">
										<Button
											disabled={isLoading}
											isLoading={isLoading}
											type="submit"
										>
											{submitLabel || (mode === "edit" ? "Save" : "Create")}
										</Button>
										<Button
											disabled={isLoading}
											onClick={() => onOpenChange(false)}
											type="button"
											variant="outline"
										>
											{cancelLabel}
										</Button>
									</DialogFooter>
								)}
							</div>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
