import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { tokenExpireIn } from "@/lib/utils";

const tokenExpireIn = 3600; // Default expire time in seconds

export interface User {
    name: string;
    email: string;
    userType?: string;
    profile?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    expireIn: number;
}

const initialAuthState: AuthState = {
    user: null,
    token: null,
    refreshToken: null,
    expireIn: tokenExpireIn,
};

export const authSlice = createSlice({
    name: "auth",
    initialState: initialAuthState,
    reducers: {
        setLogin: (state, action: PayloadAction<{ user: User; token: string; refreshToken: string; expireIn?: number }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            state.expireIn = action.payload.expireIn || tokenExpireIn;
        },
        setLogout: (state) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.expireIn = tokenExpireIn;
        },
    },
});

export const { setLogin, setLogout } = authSlice.actions;
export const authReducer = authSlice.reducer; 