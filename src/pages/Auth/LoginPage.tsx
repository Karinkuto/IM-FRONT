import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LoginForm } from "@/components/auth/LoginForm";
import { defaultRoleRedirects } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();
	const { login, isLoading, user, isAuthenticated } = useAuth();

	useEffect(() => {
		document.title = "Tila | Login";
	}, []);

	useEffect(() => {
		if (isAuthenticated && user?.role) {
			const redirectPath = defaultRoleRedirects[user.role];
			navigate(redirectPath);
		}
	}, [isAuthenticated, user, navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await login({ email, password });
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Invalid credentials. Please try again.";
			toast.error(errorMessage);
		}
	};

	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<a className="flex items-center gap-2 font-medium" href="/">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
							<svg
								aria-hidden="true"
								className="h-6 w-6"
								fill="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
							</svg>
						</div>
						<div>
							<div className="font-semibold text-lg">Tila</div>
							<div className="text-muted-foreground text-xs">
								Insurance Platform
							</div>
						</div>
					</a>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<LoginForm
							email={email}
							isLoading={isLoading}
							onSubmit={handleSubmit}
							password={password}
							setEmail={setEmail}
							setPassword={setPassword}
						/>
					</div>
				</div>
			</div>
			<div className="relative hidden bg-muted lg:block">
				<img
					alt="Login page illustration"
					className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.75]"
					src="/login-image.png"
				/>
			</div>
		</div>
	);
}
