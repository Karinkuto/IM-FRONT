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

import type { Insurer } from "./insurer";

export interface User {
	id: number;
	email: string;
	verified: boolean;
	phone_number: string | null;
	fin: string | null;
	temporary_password: string | null;
	roles: string[];
	created_at: string;
	updated_at: string;
	customer?: Customer;
	insurer?: Insurer;
}
