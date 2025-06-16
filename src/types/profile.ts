export interface InsurerProfile {
  id: string;
  companyName: string;
  description?: string;
  contactEmail: string;
  contactPhone?: string;
  apiEndpoint?: string;
  apiKey?: string;
  logo?: File | string | null;
  profile_complete?: boolean;
  temporary_password?: boolean;
  // Add any other profile fields as needed
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  // Add other user profile fields as needed
}

// This file contains type definitions for profile-related data structures.
// It's used throughout the application to ensure type safety when working with profile data.
