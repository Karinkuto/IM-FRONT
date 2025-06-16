import { LoginForm } from "@/components/auth/LoginForm";
import { defaultRoleRedirects } from "@/config/routes";
import { useLoginMutation } from "@/redux/api/authApi";
import { setCredentials } from "@/redux/slices/authSlice";
import type { RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type DataError = { data?: { message?: string } };

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [login, { isLoading }] = useLoginMutation();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const user = useSelector((state: RootState) => state.auth.user);

	useEffect(() => {
		document.title = "Tila | Login";
		if (user) {
			// Get the first role from the roles array
			const userRole = user.roles?.[0]?.name;

			if (userRole && defaultRoleRedirects[userRole]) {
				const redirectPath = defaultRoleRedirects[userRole];
				navigate(redirectPath);
			}
		}
	}, [user, navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const response = await login({ email, password }).unwrap();

			// The response has the structure: { success: boolean, data: { access_token: string, user: User } }
			if (!response.success || !response.data) {
				throw new Error("Invalid response from server");
			}

			const { access_token, user: userData } = response.data;

			if (!userData || !access_token) {
				throw new Error("Invalid user data or access token");
			}

			// Ensure roles array exists and has at least one role
			if (!userData.roles || userData.roles.length === 0) {
				throw new Error("User has no roles assigned");
			}

			// For backward compatibility, set the first role as the primary role
			const userWithRole = {
				...userData,
				role: userData.roles[0].name,
			};

			dispatch(
				setCredentials({
					user: userWithRole,
					token: access_token,
				}),
			);

			toast.success("Login successful!");
		} catch (error: unknown) {
			let message = "An error occurred during login";
			if (
				typeof error === "object" &&
				error !== null &&
				"data" in error &&
				error.data &&
				typeof error.data === "object" &&
				"message" in error.data
			) {
				message = String(error.data.message);
			} else if (error instanceof Error) {
				message = error.message;
			}
			toast.error(`Login failed: ${message}`);
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
