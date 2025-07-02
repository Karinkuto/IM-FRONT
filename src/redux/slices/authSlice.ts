import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types/auth";

interface AuthState {
	user: User | null;
	access_token: string | null;
	isAuthenticated: boolean;
}

const initialState: AuthState = {
	user: null,
	access_token: null,
	isAuthenticated: false,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setCredentials: (
			state,
			action: PayloadAction<{ access_token: string; user: User }>
		) => {
			state.access_token = action.payload.access_token;
			state.user = action.payload.user;
			state.isAuthenticated = true;
		},
		logout: (state) => {
			state.access_token = null;
			state.user = null;
			state.isAuthenticated = false;
		},
	},
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
