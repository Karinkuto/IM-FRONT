import type React from "react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface LoginFormProps {
	email: string;
	setEmail: React.Dispatch<React.SetStateAction<string>>;
	password: string;
	setPassword: React.Dispatch<React.SetStateAction<string>>;
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
	isLoading: boolean;
	className?: string;
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
	const usernameId = useId();
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
					<Label htmlFor={usernameId}>Username</Label>
					<Input
						id={usernameId}
						name="username"
						type="text"
						autoComplete="username"
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
					<Input
						id={passwordId}
						name="password"
						type="password"
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
