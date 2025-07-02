import { Component, type ReactNode } from "react";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
	};

	public static getDerivedStateFromError(): State {
		// Update state so the next render will show the fallback UI.
		return { hasError: true };
	}

	public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// You can also log the error to an error reporting service
		console.error("Uncaught error:", error, errorInfo);
	}

	public render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			return (
				<div className="flex h-screen items-center justify-center bg-red-100 text-red-700">
					<h1 className="font-bold text-2xl">Something went wrong.</h1>
				</div>
			);
		}

		return this.props.children;
	}
}
