export interface Insurer {
	id: string;
	name: string;
	description: string | null;
	contact_email: string;
	contact_phone: string;
	api_endpoint: string | null;
	logo_url: string | null;
	user_id: number;
}
