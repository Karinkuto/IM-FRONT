import type { Insurer } from "./insurer";

export type UserRole = "admin" | "customer" | "insurer";

export interface Customer {
	user_id: number;
	first_name: string;
	middle_name: string;
	last_name: string;
	birthdate: string; // ISO date string
	gender: string;
	region: string;
	subcity: string;
	woreda: string;
	created_at: string;
	updated_at: string;
}

export interface User {
	id: string | number;
	email?: string;
	verified?: boolean;
	phone_number?: string | null;
	fin?: string | null;
	temporary_password?: string | boolean | null;
	roles?: string[] | { id: number; name: UserRole; [key: string]: unknown }[];
	created_at?: string;
	updated_at?: string;
	customer?: Customer;
	insurer?: Insurer;
	role?: UserRole;
	name?: string;
}
