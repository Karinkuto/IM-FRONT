import { configureStore } from "@reduxjs/toolkit";
import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector } from "react-redux";

import authReducer from "./slices/authSlice";

import { authApi } from "@/redux/apis/authApi";

// import your RTK Query APIs
// import { authApi } from './apis/authApi';

export const store = configureStore({
	reducer: {
		auth: authReducer,
		[authApi.reducerPath]: authApi.reducer,
		// your domain slices
		// auth: authReducer,
		// RTK Query "service" reducers
		// [authApi.reducerPath]: authApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(authApi.middleware),
	// add RTK Query middleware for each service
	//   .concat(authApi.middleware, postsApi.middleware)
	devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// typed hooks everywhere
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
