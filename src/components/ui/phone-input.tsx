"use client";

import { ChevronDownIcon, PhoneIcon } from "lucide-react";
import React, { useId } from "react";
import {
	type Control,
	Controller,
	type FieldValues,
	type Path,
} from "react-hook-form";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PhoneNumberInputProps<TFieldValues extends FieldValues> = {
	control: Control<TFieldValues>;
	name: Path<TFieldValues>;
	label: string;
	placeholder?: string;
};

export function PhoneNumberInput<TFieldValues extends FieldValues>({
	control,
	name,
	label,
	placeholder,
}: PhoneNumberInputProps<TFieldValues>) {
	const id = useId();

	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => (
				<div className="*:not-first:mt-2" dir="ltr">
					<Label htmlFor={id}>{label}</Label>
					<RPNInput.default
						className="flex rounded-md shadow-xs"
						defaultCountry="ET"
						flagComponent={FlagComponent}
						countrySelectComponent={CountrySelect}
						inputComponent={CustomPhoneInput}
						id={id}
						placeholder={placeholder}
						value={field.value}
						onChange={(value) => field.onChange(value ?? "")}
					/>
				</div>
			)}
		/>
	);
}

const CustomPhoneInput = React.forwardRef<
	HTMLInputElement,
	React.ComponentProps<"input">
>(({ className, ...props }, ref) => {
	return (
		<Input
			ref={ref}
			data-slot="phone-input"
			className={cn(
				"-ms-px rounded-s-none shadow-none focus-visible:z-10",
				className,
			)}
			{...props}
		/>
	);
});

CustomPhoneInput.displayName = "PhoneInput";

type CountrySelectProps = {
	disabled?: boolean;
	value: RPNInput.Country;
	onChange: (value: RPNInput.Country) => void;
	options: { label: string; value: RPNInput.Country | undefined }[];
};

const CountrySelect = ({
	disabled,
	value,
	onChange,
	options,
}: CountrySelectProps) => {
	const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
		onChange(event.target.value as RPNInput.Country);
	};

	return (
		<div className="border-input bg-background text-muted-foreground focus-within:border-ring focus-within:ring-ring/50 hover:bg-accent hover:text-foreground has-aria-invalid:border-destructive/60 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 relative inline-flex h-10 items-center rounded-s-md border ps-3 pe-2 transition-[color,box-shadow] outline-none focus-within:z-10 focus-within:ring-[3px] has-disabled:pointer-events-none has-disabled:opacity-50">
			<div className="inline-flex items-center gap-2" aria-hidden="true">
				<FlagComponent country={value} countryName={value} aria-hidden="true" />
				<span className="text-sm font-semibold">
					+{RPNInput.getCountryCallingCode(value)}
				</span>
				<span className="text-muted-foreground/80">
					<ChevronDownIcon size={16} aria-hidden="true" />
				</span>
			</div>
			<select
				disabled={disabled}
				value={value}
				onChange={handleSelect}
				className="absolute inset-0 text-sm opacity-0"
				aria-label="Select country"
			>
				<option key="default" value="">
					Select a country
				</option>
				{options
					.filter((x) => x.value)
					.map((option, i) => (
						<option key={option.value ?? `empty-${i}`} value={option.value}>
							{option.label}{" "}
							{option.value &&
								`+${RPNInput.getCountryCallingCode(option.value)}`}
						</option>
					))}
			</select>
		</div>
	);
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
	const Flag = flags[country];

	return (
		<span className="w-5 overflow-hidden rounded-sm">
			{Flag ? (
				<Flag title={countryName} />
			) : (
				<PhoneIcon size={16} aria-hidden="true" />
			)}
		</span>
	);
};
