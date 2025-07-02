import { Loader2 } from "lucide-react";

export const LoadingSpinner = () => (
	<div className="flex h-full min-h-[calc(100vh-80px)] flex-col items-center justify-center space-y-4">
		<Loader2 className="h-12 w-12 animate-spin text-primary" />
		<p className="font-medium text-lg text-muted-foreground">Loading data...</p>
	</div>
);
