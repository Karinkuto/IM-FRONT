import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import type React from "react";
import { useId } from "react";
import {
	type ControllerRenderProps,
	type DefaultValues,
	type FieldPath,
	type FieldValues,
	type UseFormReturn,
	useForm,
} from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface FormFieldOption {
	value: string;
	label: string;
}

export interface SmartFormProps<
	T extends FieldValues = FieldValues,
	R = unknown,
> {
	schema: z.ZodSchema<T>;
	mutationFn: (data: T) => Promise<R>;
	queryKey?: string[];
	mode?: "create" | "edit";
	defaultValues?: Partial<T>;
	onSuccess?: (data: R) => void;
	onError?: (error: Error) => void;
	submitText?: string;
	className?: string;
	children: (form: UseFormReturn<T>) => React.ReactNode;
	card?: boolean;
}

export interface SmartFormFieldProps<T extends FieldValues = FieldValues> {
	form: UseFormReturn<T>;
	name: FieldPath<T>;
	type:
		| "text"
		| "email"
		| "password"
		| "number"
		| "textarea"
		| "select"
		| "checkbox"
		| "radio"
		| "color";
	label?: string;
	placeholder?: string;
	description?: string;
	options?: FormFieldOption[];
	disabled?: boolean;
	className?: string;
	icon?: React.ReactNode;
	render?: (props: {
		field: ControllerRenderProps<T, FieldPath<T>>;
		id: string;
	}) => React.ReactNode;
}

export interface FormSectionProps {
	title: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
}

function getStatusIcon(mutation: { isSuccess: boolean; isError: boolean }) {
	if (mutation.isSuccess) {
		return <CheckCircle className="mr-2 h-4 w-4" />;
	}
	if (mutation.isError) {
		return <AlertCircle className="mr-2 h-4 w-4" />;
	}
	return null;
}

export function SmartForm<T extends FieldValues>({
	schema,
	mutationFn,
	queryKey = [],
	mode = "create",
	defaultValues,
	onSuccess,
	onError,
	submitText,
	className,
	children,
	card = true,
}: SmartFormProps<T>) {
	const queryClient = useQueryClient();

	const form = useForm<T>({
		resolver: zodResolver(schema),
		defaultValues: (defaultValues || {}) as DefaultValues<T>,
	});

	const mutation = useMutation({
		mutationFn,
		onSuccess: (data) => {
			if (queryKey.length > 0) {
				queryClient.invalidateQueries({ queryKey });
			}
			form.reset();
			onSuccess?.(data);
		},
		onError: (error) => {
			onError?.(error instanceof Error ? error : new Error("Unknown error"));
		},
	});

	const onSubmit = (data: T) => {
		mutation.mutate(data);
	};

	const formContent = (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<CardContent className="p-6">
					<div className="space-y-6">{children(form)}</div>

					<div className="mt-6 flex items-center justify-end border-t pt-6">
						<Button
							className="min-w-32"
							disabled={mutation.isPending}
							type="submit"
						>
							{mutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{mode === "create" ? "Creating..." : "Updating..."}
								</>
							) : (
								<>
									{getStatusIcon(mutation)}
									{submitText || (mode === "create" ? "Create" : "Update")}
								</>
							)}
						</Button>
					</div>
				</CardContent>
			</form>
		</Form>
	);

	if (card) {
		return <Card className={cn("w-full", className)}>{formContent}</Card>;
	}
	return formContent;
}

export function SmartFormField<T extends FieldValues>({
	form,
	name,
	type,
	label,
	placeholder,
	description,
	options = [],
	disabled,
	className,
	icon,
	render,
}: SmartFormFieldProps<T>) {
	const generatedId = useId();
	const renderField = (
		field: ControllerRenderProps<T, FieldPath<T>>,
		id: string = generatedId
	) => {
		switch (type) {
			case "text":
			case "email":
			case "password":
				return (
					<Input
						disabled={disabled}
						icon={icon}
						placeholder={placeholder}
						type={type}
						{...field}
						id={id}
						value={field.value || ""}
					/>
				);

			case "number":
				return (
					<Input
						disabled={disabled}
						placeholder={placeholder}
						type="number"
						{...field}
						onChange={(e) => {
							const value = e.target.value;
							field.onChange(value === "" ? undefined : Number(value));
						}}
						value={field.value || ""}
					/>
				);

			case "textarea":
				return (
					<Textarea
						disabled={disabled}
						icon={icon}
						placeholder={placeholder}
						rows={3}
						{...field}
						value={field.value || ""}
					/>
				);

			case "select":
				return (
					<Select
						defaultValue={field.value}
						disabled={disabled}
						onValueChange={field.onChange}
					>
						<SelectTrigger>
							<SelectValue placeholder={placeholder || `Select ${label}`} />
						</SelectTrigger>
						<SelectContent>
							{options.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				);

			case "checkbox":
				return (
					<FormItem className="flex items-center space-x-2">
						<FormControl>
							<Checkbox
								checked={field.value}
								disabled={disabled}
								id={field.name}
								onCheckedChange={field.onChange}
							/>
						</FormControl>
						<FormLabel
							className="font-normal text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							htmlFor={field.name}
						>
							{label}
						</FormLabel>
					</FormItem>
				);

			case "radio":
				return (
					<RadioGroup
						defaultValue={field.value}
						disabled={disabled}
						onValueChange={field.onChange}
					>
						{options.map((option) => (
							<div className="flex items-center space-x-2" key={option.value}>
								<RadioGroupItem
									id={`${name}-${option.value}`}
									value={option.value}
								/>
								<label
									className="cursor-pointer font-normal text-sm"
									htmlFor={`${name}-${option.value}`}
								>
									{option.label}
								</label>
							</div>
						))}
					</RadioGroup>
				);

			case "color":
				return (
					<div className="flex items-center space-x-2">
						<Input
							className="h-10 w-12 rounded border p-1"
							disabled={disabled}
							onChange={(e) => field.onChange(e.target.value)}
							type="color"
							value={field.value || "#000000"}
						/>
						<Input
							className="flex-1"
							disabled={disabled}
							onChange={(e) => field.onChange(e.target.value)}
							placeholder="#000000"
							type="text"
							value={field.value || ""}
						/>
					</div>
				);

			default:
				return null;
		}
	};

	if (type === "checkbox") {
		return (
			<FormField
				control={form.control}
				name={name}
				render={({ field }) => (
					<FormItem className={cn("space-y-2", className)}>
						<FormControl>
							{render
								? render({ field, id: generatedId })
								: renderField(field, generatedId)}
						</FormControl>
						{description && <FormDescription>{description}</FormDescription>}
						<FormMessage />
					</FormItem>
				)}
			/>
		);
	}

	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => {
				const id = generatedId;
				return (
					<FormItem className={className}>
						{label && <FormLabel htmlFor={id}>{label}</FormLabel>}
						<FormControl>
							{render ? render({ field, id }) : renderField(field, id)}
						</FormControl>
						{description && <FormDescription>{description}</FormDescription>}
						<FormMessage />
					</FormItem>
				);
			}}
		/>
	);
}

export function FormSection({
	title,
	description,
	children,
	className,
}: FormSectionProps) {
	return (
		<div className={cn("space-y-4", className)}>
			<div className="space-y-1">
				<h3 className="font-medium text-lg">{title}</h3>
				{description && (
					<p className="text-muted-foreground text-sm">{description}</p>
				)}
			</div>
			<div className="space-y-4">{children}</div>
		</div>
	);
}

export function ConditionalField<T extends FieldValues, V = unknown>({
	form,
	when,
	equals,
	children,
}: {
	form: UseFormReturn<T>;
	when: FieldPath<T>;
	equals: V;
	children: React.ReactNode;
}) {
	const watchedValue = form.watch(when);

	if (watchedValue === equals) {
		return <>{children}</>;
	}

	return null;
}
