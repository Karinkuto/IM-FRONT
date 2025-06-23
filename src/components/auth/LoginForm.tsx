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
				<h1 className="text-2xl font-bold">Login to your account</h1>
				<p className="text-muted-foreground text-sm text-balance">
					Enter your email below to login to your account
				</p>
			</div>
			<div className="grid gap-6">
				<div className="grid gap-3">
					<Label htmlFor={emailId}>Email</Label>
					<Input
						id={emailId}
						name="email"
						type="email"
						autoComplete="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="mt-1 block w-full"
					/>
				</div>
				<div className="grid gap-3">
					<div className="flex items-center">
						<Label htmlFor={passwordId}>Password</Label>
						<a
							href="/forgot-password"
							className="ml-auto text-sm underline-offset-4 hover:underline"
						>
							Forgot your password?
						</a>
					</div>
					<PasswordInput
						id={passwordId}
						name="password"
						autoComplete="current-password"
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="mt-1 block w-full"
					/>
				</div>
				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? "Logging in..." : "Login"}
				</Button>
			</div>
		</form>
	);
}
