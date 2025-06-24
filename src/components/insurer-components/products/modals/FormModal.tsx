import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
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

export interface FormModalProps<T> {
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

export function FormModal<T>({
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
		resolver: zodResolver(validationSchema),
		defaultValues: initialValues as T,
	});

	// Only depend on initialValues to avoid useEffect dependency warning
	useEffect(() => {
		console.log("[FormModal] initialValues changed:", initialValues);
		if (initialValues) {
			form.reset(initialValues as T);
		}
	}, [initialValues, form.reset]);

	const handleSubmit = form.handleSubmit((values) => {
		onSubmit(values);
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
				<Form {...form}>
					<form onSubmit={handleSubmit} className="space-y-6">
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
								{renderFields(form)}
								{showFooter && (
									<DialogFooter className="mt-6">
										<Button
											type="submit"
											disabled={isLoading}
											isLoading={isLoading}
										>
											{submitLabel || (mode === "edit" ? "Save" : "Create")}
										</Button>
										<Button
											type="button"
											variant="outline"
											onClick={() => onOpenChange(false)}
											disabled={isLoading}
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
