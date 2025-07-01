export interface Insurer {
	id: string;
	name: string;
	description: string | null;
	contact_email: string;
	contact_phone: string;
	api_endpoint: string | null;
	api_key?: string;
	logo_url: string | null;
	user_id: number;
	user?: {
		id: number;
		email: string;
		verified: boolean;
		phone_number: string | null;
		fin: string | null;
		temporary_password: boolean;
		roles: Array<{
			id: number;
			name: string;
			created_at: string;
			updated_at: string;
		}>;
		created_at: string;
		updated_at: string;
	};
}
