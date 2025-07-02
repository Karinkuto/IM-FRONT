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
			control={control}
			name={name}
			render={({ field }) => (
				<div className="*:not-first:mt-2" dir="ltr">
					<Label htmlFor={id}>{label}</Label>
					<RPNInput.default
						className="flex rounded-md shadow-xs"
						countrySelectComponent={CountrySelect}
						defaultCountry="ET"
						flagComponent={FlagComponent}
						id={id}
						inputComponent={CustomPhoneInput}
						onChange={(value) => field.onChange(value ?? "")}
						placeholder={placeholder}
						value={field.value}
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
			className={cn(
				"-ms-px rounded-s-none shadow-none focus-visible:z-10",
				className
			)}
			data-slot="phone-input"
			ref={ref}
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
		<div className="relative inline-flex h-10 items-center rounded-s-md border border-input bg-background ps-3 pe-2 text-muted-foreground outline-none transition-[color,box-shadow] focus-within:z-10 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 hover:bg-accent hover:text-foreground has-disabled:pointer-events-none has-aria-invalid:border-destructive/60 has-disabled:opacity-50 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40">
			<div aria-hidden="true" className="inline-flex items-center gap-2">
				<FlagComponent aria-hidden="true" country={value} countryName={value} />
				<span className="font-semibold text-sm">
					+{RPNInput.getCountryCallingCode(value)}
				</span>
				<span className="text-muted-foreground/80">
					<ChevronDownIcon aria-hidden="true" size={16} />
				</span>
			</div>
			<select
				aria-label="Select country"
				className="absolute inset-0 text-sm opacity-0"
				disabled={disabled}
				onChange={handleSelect}
				value={value}
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
				<PhoneIcon aria-hidden="true" size={16} />
			)}
		</span>
	);
};
