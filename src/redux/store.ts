import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/authApi";
import { productsApi } from "./api/productsApi";
import { usersApi } from "./api/usersApi";
import authReducer from "./slices/authSlice";

export const store = configureStore({
	reducer: {
		auth: authReducer,
		[authApi.reducerPath]: authApi.reducer,
		[usersApi.reducerPath]: usersApi.reducer,
		[productsApi.reducerPath]: productsApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: ["persist/PERSIST"],
				ignoredActionPaths: ["meta.arg", "payload.timestamp"],
				ignoredPaths: ["items.dates"],
			},
		}).concat(authApi.middleware, usersApi.middleware, productsApi.middleware),
	devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
