import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LoginForm } from "@/components/auth/LoginForm";
import { defaultRoleRedirects } from "@/config/routes";
import { useAuth } from "@/context/AuthContext";
import { fetchUser } from "@/services/authService";
import type { User } from "@/types/auth";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth();

	useEffect(() => {
		document.title = "Tila | Login";
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			await login({ email, password });
			toast.success("Login successful!");
			// Redirect based on role or a default path after login
			const loggedInUser = (await fetchUser()) as User; // Fetch user to get their actual role
			const redirectPath = defaultRoleRedirects[loggedInUser.role];
			navigate(redirectPath);
		} catch (error: unknown) {
			toast.error(`Login failed: ${(error as Error).message}`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<a href="/" className="flex items-center gap-2 font-medium">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="h-6 w-6"
								aria-hidden="true"
							>
								<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
							</svg>
						</div>
						<div>
							<div className="font-semibold text-lg">Tila</div>
							<div className="text-xs text-muted-foreground">
								Insurance Platform
							</div>
						</div>
					</a>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<LoginForm
							email={email}
							setEmail={setEmail}
							password={password}
							setPassword={setPassword}
							onSubmit={handleSubmit}
							isLoading={isLoading}
						/>
					</div>
				</div>
			</div>
			<div className="bg-muted relative hidden lg:block">
				<img
					src="/login-image.png"
					alt="Login page illustration"
					className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.75]"
				/>
			</div>
		</div>
	);
}
