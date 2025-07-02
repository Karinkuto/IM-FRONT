import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "./calendar";

interface DatePickerProps {
	date: Date | undefined;
	onSelect: (date: Date | undefined) => void;
	placeholder?: string;
	className?: string;
}

function formatDate(date: Date | undefined) {
	if (!date) {
		return "";
	}

	return format(date, "PPP");
}

function isValidDate(date: Date | undefined) {
	if (!date) {
		return false;
	}
	return !Number.isNaN(date.getTime());
}

export function DatePicker({
	date,
	onSelect,
	placeholder = "Pick a date",
	className,
}: DatePickerProps) {
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState(formatDate(date));

	React.useEffect(() => {
		setValue(formatDate(date));
	}, [date]);

	return (
		<div className={cn("relative flex gap-2", className)}>
			<Input
				className="bg-background pr-10"
				onChange={(e) => {
					const newDate = new Date(e.target.value);
					setValue(e.target.value);
					if (isValidDate(newDate)) {
						onSelect(newDate);
					}
				}}
				onKeyDown={(e) => {
					if (e.key === "ArrowDown") {
						e.preventDefault();
						setOpen(true);
					}
				}}
				placeholder={placeholder}
				value={value}
			/>
			<Popover onOpenChange={setOpen} open={open}>
				<PopoverTrigger asChild>
					<Button
						className="-translate-y-1/2 absolute top-1/2 right-2 size-6"
						variant="ghost"
					>
						<CalendarIcon className="size-3.5" />
						<span className="sr-only">Select date</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent align="end" className="w-auto overflow-hidden p-0">
					<Calendar
						mode="single"
						onSelect={(selectedDate) => {
							onSelect(selectedDate);
							setOpen(false);
						}}
						selected={date}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
