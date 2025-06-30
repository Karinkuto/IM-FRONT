import { configureStore } from "@reduxjs/toolkit";
import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector } from "react-redux";
import { authApi } from "@/redux/apis/authApi";
import { productApi } from "@/redux/apis/productApi";
import { quotationApi } from "@/redux/apis/quotationApi";
import { userApi } from "@/redux/apis/userApi";
import { insurerApi } from "@/redux/apis/insurerApi";
import authReducer from "./slices/authSlice";

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
			authApi.middleware,
			productApi.middleware,
			quotationApi.middleware,
			userApi.middleware,
			insurerApi.middleware,
		),
	devTools: process.env.NODE_ENV !== "production",
});

// 3. Derive RootState from the rootReducer
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
