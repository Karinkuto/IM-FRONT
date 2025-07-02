import type React from "react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";

interface LoginFormProps extends React.ComponentPropsWithoutRef<"form"> {
	email: string;
	setEmail: (value: string) => void;
	password: string;
	setPassword: (value: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	isLoading: boolean;
}

export function LoginForm({
	className,
	email,
	setEmail,
	password,
	setPassword,
	onSubmit,
	isLoading,
	...props
}: LoginFormProps) {
	const emailId = useId();
	const passwordId = useId();
	return (
		<form
			className={cn("flex flex-col gap-6", className)}
			onSubmit={onSubmit}
			{...props}
		>
			<div className="flex flex-col items-center gap-2 text-center">
				<h1 className="font-bold text-2xl">Login to your account</h1>
				<p className="text-balance text-muted-foreground text-sm">
					Enter your email below to login to your account
				</p>
			</div>
			<div className="grid gap-6">
				<div className="grid gap-3">
					<Label htmlFor={emailId}>Email</Label>
					<Input
						autoComplete="email"
						className="mt-1 block w-full"
						id={emailId}
						name="email"
						onChange={(e) => setEmail(e.target.value)}
						required
						type="email"
						value={email}
					/>
				</div>
				<div className="grid gap-3">
					<div className="flex items-center">
						<Label htmlFor={passwordId}>Password</Label>
						<a
							className="ml-auto text-sm underline-offset-4 hover:underline"
							href="/forgot-password"
						>
							Forgot your password?
						</a>
					</div>
					<PasswordInput
						autoComplete="current-password"
						className="mt-1 block w-full"
						id={passwordId}
						name="password"
						onChange={(e) => setPassword(e.target.value)}
						required
						value={password}
					/>
				</div>
				<Button className="w-full" disabled={isLoading} type="submit">
					{isLoading ? "Logging in..." : "Login"}
				</Button>
			</div>
		</form>
	);
}
