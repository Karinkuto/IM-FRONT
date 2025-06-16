import type { User, UserRole } from "@/types/auth";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  user: (User & { role?: UserRole }) | null;
  token: string | null;
  isAuthenticated: boolean;
  currentRole?: UserRole;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  currentRole: undefined,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      const { user, token } = action.payload;
      
      // Ensure we have a valid user with roles
      if (!user.roles || user.roles.length === 0) {
        return;
      }

      // For backward compatibility, set the first role as the primary role
      const userWithRole = {
        ...user,
        role: user.roles[0].name
      };

      state.user = userWithRole;
      state.token = token;
      state.isAuthenticated = true;
      state.currentRole = user.roles[0].name;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.currentRole = undefined;
    },
    setCurrentRole: (state, action: PayloadAction<UserRole>) => {
      state.currentRole = action.payload;
    },
  },
});

export const { setCredentials, logout, setCurrentRole } = authSlice.actions;
export default authSlice.reducer;
