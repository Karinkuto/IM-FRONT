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
	defaultCountry?: RPNInput.Country;
	selectable?: boolean;
};

// Regex patterns for Ethiopian phone numbers
const MOBILE_PATTERN = /^[179]\d{8}$/; // 9 digits starting with 1, 7, or 9
const FIXED_LINE_PATTERN = /^1[1-9]\d{8}$/; // 10 digits starting with 11-19

// Format phone number for display
const formatPhoneNumber = (value: string): string => {
  if (!value) return '';
  
  // Remove all non-digit characters and leading zeros
  const digits = value.replace(/\D/g, '').replace(/^0+/, '');
  
  if (digits.length === 0) return '';
  
  // Format mobile number (9 digits)
  if (digits.length <= 9) {
    return digits
      .slice(0, 10)
      .replace(/^(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')
      .trim();
  }
  
  // Format fixed line (10 digits)
  return digits
    .slice(0, 10)
    .replace(/^(\d{2})(\d{4})(\d{4})/, '$1 $2 $3')
    .trim();
};

// Clean phone number for storage (remove all non-digit characters and leading zeros)
const cleanPhoneNumber = (value: string): string => {
  return value.replace(/\D/g, '').replace(/^0+/, '');
};

export function PhoneNumberInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder = "e.g. 911 234 567 or 011 234 5678",
  defaultCountry = "ET",
  selectable = true,
}: PhoneNumberInputProps<TFieldValues>) {
  const id = useId();
  const [error, setError] = React.useState<string | null>(null);

  const validatePhoneNumber = (value: string): boolean => {
    if (!value) {
      setError("Phone number is required");
      return false;
    }

    // Remove all non-digit characters and leading 0
    const digits = cleanPhoneNumber(value);
    
    if (digits.length === 9) {
      if (!MOBILE_PATTERN.test(digits)) {
        setError("Mobile number must start with 9, 7, or 1");
        return false;
      }
    } else if (digits.length === 10) {
      if (!FIXED_LINE_PATTERN.test(digits)) {
        setError("Fixed line number must start with 11-19");
        return false;
      }
    } else {
      setError("Phone number must be 9 (mobile) or 10 (fixed) digits");
      return false;
    }

    setError(null);
    return true;
  };

  // Map of country codes to their international dialing codes
  const countryDialingCodes: Record<string, string> = {
    'ET': '+251', // Ethiopia
    'US': '+1',   // United States
    'GB': '+44',  // United Kingdom
    // Add more country codes as needed
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const country = field.value?.split(' ')[0] || defaultCountry;
    const inputValue = e.target.value;
    
    // Format the displayed value
    const formattedValue = formatPhoneNumber(inputValue);
    
    // Get cursor position before formatting
    const cursorPosition = e.target.selectionStart || 0;
    const cursorOffset = formattedValue.length - inputValue.length;
    
    // Update the field value with formatted display
    e.target.value = formattedValue;
    
    // Set cursor position after formatting
    setTimeout(() => {
      const newPosition = Math.max(0, cursorPosition + cursorOffset);
      e.target.setSelectionRange(newPosition, newPosition);
    }, 0);
    
    // Store clean value in the form with international format
    const cleanNumber = cleanPhoneNumber(inputValue);
    const dialingCode = countryDialingCodes[country] || '';
    
    // Store in format: +251911234567
    if (cleanNumber) {
      field.onChange(`${dialingCode}${cleanNumber}`);
    } else {
      field.onChange('');
    }
    
    // Run validation on the clean number
    validatePhoneNumber(cleanNumber);
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="*:not-first:mt-2 w-full" dir="ltr">
          <Label htmlFor={id}>{label}</Label>
          <div className="grid grid-cols-4 gap-0 w-full">
            <div className="col-span-1">
              <CountrySelect
                disabled={!selectable}
                value={(() => {
                  // If we have a value that starts with a country code, use that country
                  if (field.value?.startsWith('+')) {
                    const found = Object.entries(countryDialingCodes).find(([_, code]) => 
                      field.value?.startsWith(code)
                    );
                    if (found) return found[0] as RPNInput.Country;
                  }
                  // Otherwise, try to get country from the stored value or use default
                  const countryFromValue = field.value?.split(' ')[0];
                  return (countryFromValue && RPNInput.getCountries().includes(countryFromValue as RPNInput.Country))
                    ? countryFromValue as RPNInput.Country
                    : defaultCountry;
                })()}
                onChange={(country) => {
                  const dialingCode = countryDialingCodes[country] || '';
                  // Get the current number without any country code
                  let currentNumber = '';
                  if (field.value) {
                    // Find if current value starts with any country code
                    const currentDialingCode = Object.values(countryDialingCodes).find(code => 
                      field.value?.startsWith(code)
                    );
                    currentNumber = currentDialingCode 
                      ? field.value.slice(currentDialingCode.length) 
                      : field.value.replace(/^\+\d+/, '');
                  }
                  field.onChange(currentNumber ? `${dialingCode}${currentNumber}` : '');
                }}
                options={RPNInput.getCountries().map(country => ({
                  label: country,
                  value: country,
                }))}
              />
            </div>
            <div className="col-span-3">
              <Input
                id={id}
                className={`rounded-l-none h-9 w-full ${
                  error ? 'border-destructive focus-visible:ring-destructive' : ''
                }`}
                placeholder={placeholder}
                value={formatPhoneNumber(field.value?.replace(/^\+\d+/, '') || '')}
                onChange={(e) => handlePhoneChange(e, field)}
                onBlur={() => {
                  const phone = field.value?.replace(/^\+\d+/, '');
                  if (phone) validatePhoneNumber(phone);
                }}
              />
            </div>
          </div>
          {error && (
            <p className="text-xs text-destructive mt-1">
              {error}
            </p>
          )}
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
				"h-9 rounded-l-none border-l-0 w-full",
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
		<div className="relative flex items-center h-9 w-full rounded-l-md border border-input border-r-0 bg-transparent px-3 py-1 text-sm shadow-sm focus-within:z-10 focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 has-aria-invalid:border-destructive/60 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40">
			<div aria-hidden="true" className="inline-flex items-center gap-2 w-full">
				<FlagComponent aria-hidden="true" country={value} countryName={value} />
				<span className="font-semibold text-sm whitespace-nowrap">
					+{RPNInput.getCountryCallingCode(value)}
				</span>
				{!disabled && (
					<span className="text-muted-foreground/80 ml-auto">
						<ChevronDownIcon aria-hidden="true" size={16} />
					</span>
				)}
			</div>
			<select
				aria-label="Select country"
				className={`absolute inset-0 w-full h-full opacity-0 ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
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
							{option.label} {option.value && `+${RPNInput.getCountryCallingCode(option.value)}`}
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
