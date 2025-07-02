import type { User as AuthUser } from "@/types/auth";
import type { User as ApiUser } from "@/types/user";

export function mapApiUserToAuthUser(apiUser: ApiUser): AuthUser {
	// Extract role from roles array if not directly on user
	let role: "admin" | "customer" | "insurer" = "customer";

	if (apiUser.role) {
		// If role is directly on the user object
		role = apiUser.role as "admin" | "customer" | "insurer";
	} else if (Array.isArray(apiUser.roles) && apiUser.roles.length > 0) {
		// If roles is an array of role objects
		const roleObj = apiUser.roles.find(
			(r) =>
				typeof r === "object" &&
				r !== null &&
				"name" in r &&
				["admin", "customer", "insurer"].includes(String(r.name))
		);

		if (roleObj && typeof roleObj === "object" && "name" in roleObj) {
			role = roleObj.name as "admin" | "customer" | "insurer";
		}
	}

	// Handle customer data - ensure all required Customer fields are provided
	const customer = apiUser.customer
		? {
				user_id:
					typeof apiUser.id === "number"
						? apiUser.id
						: Number.parseInt(apiUser.id || "0", 10) || 0,
				first_name: apiUser.customer.first_name || "",
				middle_name: apiUser.customer.middle_name || "",
				last_name: apiUser.customer.last_name || "",
				birthdate:
					"customer" in apiUser &&
					typeof apiUser.customer === "object" &&
					apiUser.customer !== null &&
					"birthdate" in apiUser.customer
						? String(apiUser.customer.birthdate)
						: "1900-01-01",
				gender:
					"customer" in apiUser &&
					typeof apiUser.customer === "object" &&
					apiUser.customer !== null &&
					"gender" in apiUser.customer
						? String(apiUser.customer.gender)
						: "unknown",
				region:
					"customer" in apiUser &&
					typeof apiUser.customer === "object" &&
					apiUser.customer !== null &&
					"region" in apiUser.customer
						? String(apiUser.customer.region)
						: "",
				subcity:
					"customer" in apiUser &&
					typeof apiUser.customer === "object" &&
					apiUser.customer !== null &&
					"subcity" in apiUser.customer
						? String(apiUser.customer.subcity)
						: "",
				woreda:
					"customer" in apiUser &&
					typeof apiUser.customer === "object" &&
					apiUser.customer !== null &&
					"woreda" in apiUser.customer
						? String(apiUser.customer.woreda)
						: "",
				created_at:
					"customer" in apiUser &&
					typeof apiUser.customer === "object" &&
					apiUser.customer !== null &&
					"created_at" in apiUser.customer
						? String(apiUser.customer.created_at)
						: new Date().toISOString(),
				updated_at:
					"customer" in apiUser &&
					typeof apiUser.customer === "object" &&
					apiUser.customer !== null &&
					"updated_at" in apiUser.customer
						? String(apiUser.customer.updated_at)
						: new Date().toISOString(),
			}
		: undefined;

	// Handle insurer data - ensure all required Insurer fields are provided
	const insurer = apiUser.insurer
		? {
				id:
					"insurer" in apiUser &&
					typeof apiUser.insurer === "object" &&
					apiUser.insurer !== null &&
					"id" in apiUser.insurer
						? String(apiUser.insurer.id)
						: "",
				name: apiUser.insurer.name || "",
				description:
					"insurer" in apiUser &&
					typeof apiUser.insurer === "object" &&
					apiUser.insurer !== null &&
					"description" in apiUser.insurer
						? String(apiUser.insurer.description)
						: "",
				contact_email:
					"insurer" in apiUser &&
					typeof apiUser.insurer === "object" &&
					apiUser.insurer !== null &&
					"contact_email" in apiUser.insurer
						? String(apiUser.insurer.contact_email)
						: "",
				contact_phone:
					"insurer" in apiUser &&
					typeof apiUser.insurer === "object" &&
					apiUser.insurer !== null &&
					"contact_phone" in apiUser.insurer
						? String(apiUser.insurer.contact_phone)
						: "",
				api_endpoint:
					"insurer" in apiUser &&
					typeof apiUser.insurer === "object" &&
					apiUser.insurer !== null &&
					"api_endpoint" in apiUser.insurer
						? String(apiUser.insurer.api_endpoint)
						: null,
				logo_url:
					"insurer" in apiUser &&
					typeof apiUser.insurer === "object" &&
					apiUser.insurer !== null &&
					"logo_url" in apiUser.insurer
						? String(apiUser.insurer.logo_url)
						: null,
				user_id: 0,
			}
		: undefined;

	// Map the user data to AuthUser type
	return {
		id: String(apiUser.id || ""),
		email: apiUser.email || "",
		phone_number: apiUser.phone_number || "",
		role,
		name: apiUser.name || "",
		fin: apiUser.fin || "",
		temporary_password: Boolean(apiUser.temporary_password),
		roles: Array.isArray(apiUser.roles)
			? apiUser.roles.map((r) => ({
					id:
						typeof r === "object" && r !== null && "id" in r ? Number(r.id) : 0,
					name:
						typeof r === "object" &&
						r !== null &&
						"name" in r &&
						typeof r.name === "string" &&
						["admin", "customer", "insurer"].includes(r.name)
							? (r.name as "admin" | "customer" | "insurer")
							: "customer",
				}))
			: [],
		customer,
		insurer,
	};
}
