import { configureStore } from "@reduxjs/toolkit";
import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector } from "react-redux";
import { authApi } from "@/redux/apis/authApi";
import { insurerApi } from "@/redux/apis/insurerApi";
import { productApi } from "@/redux/apis/productApi";
import { quotationApi } from "@/redux/apis/quotationApi";
import { userApi } from "@/redux/apis/userApi";
import authReducer from "./slices/authSlice";

// Error listener middleware to handle global API errors
const errorHandlerMiddleware = () => (next: any) => (action: any) => {
	// Listen for rejected API calls
	if (action.type?.endsWith('/rejected')) {
		const error = action.payload;
		
		// Handle 401 errors globally
		if (error?.status === 401) {
			console.warn('Global 401 error detected:', action.type);
			
			// Clear local storage tokens
			localStorage.removeItem("access_token");
			localStorage.removeItem("refresh_token");
			
			// Clear session storage
			try {
				sessionStorage.removeItem("auth");
			} catch (e) {
				console.error("Error clearing session storage:", e);
			}
			
			// Only redirect if not already on login page
			if (!window.location.pathname.includes('/login')) {
				console.log('Redirecting to login due to global 401 error...');
				window.location.href = "/login";
			}
		}
	}
	
	return next(action);
};

// 1. Define root reducer separately
const rootReducer = {
	auth: authReducer,
	[authApi.reducerPath]: authApi.reducer,
	[productApi.reducerPath]: productApi.reducer,
	[quotationApi.reducerPath]: quotationApi.reducer,
	[userApi.reducerPath]: userApi.reducer,
	[insurerApi.reducerPath]: insurerApi.reducer,
};

// 2. Create store using the rootReducer
export const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(
			errorHandlerMiddleware,
			authApi.middleware,
			productApi.middleware,
			quotationApi.middleware,
			userApi.middleware,
			insurerApi.middleware
		),
	devTools: process.env.NODE_ENV !== "production",
});

// 3. Derive RootState from the rootReducer
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
