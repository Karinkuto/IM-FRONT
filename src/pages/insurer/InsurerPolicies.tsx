import { useEffect, useState } from "react";
import { PoliciesTable } from "@/components/insurer-components/policies/PoliciesTable";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { fetchPolicies } from "@/services/policyService";
import type { Policy } from "@/types/policy";

export default function AdminPolicies() {
	const [policies, setPolicies] = useState<Policy[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const getPolicies = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const fetchedPolicies = await fetchPolicies();
				setPolicies(fetchedPolicies);
			} catch (err) {
				setError(err as Error);
			} finally {
				setIsLoading(false);
			}
		};
		getPolicies();
	}, []);

	if (isLoading) {
		return <LoadingSpinner />;
	}

	if (error) {
		return (
			<div className="flex h-full min-h-[calc(100vh-80px)] items-center justify-center text-red-500">
				<p className="font-medium text-lg">Error: {error.message}</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-start justify-between">
				<div>
					<h1 className="font-bold text-2xl">Insurance Policies</h1>
					<p className="text-muted-foreground text-sm">
						View and manage all active, expired, and cancelled insurance
						policies.
					</p>
				</div>
			</div>

			<PoliciesTable policies={policies} />
		</div>
	);
}
