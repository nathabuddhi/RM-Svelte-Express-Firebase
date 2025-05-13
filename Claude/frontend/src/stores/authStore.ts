import { writable } from "svelte/store";

interface AuthState {
    isAuthenticated: boolean;
    user: {
        uid: string;
        email: string;
        role: string;
    } | null;
    token: string;
}

// Create the initial auth state
const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: "",
};

// Create a writable store for auth state
export const authStore = writable<AuthState>(initialState);

// Function to set user data when logged in
export const setUser = (userData: any, token: string) => {
    authStore.update((state) => ({
        ...state,
        isAuthenticated: true,
        user: {
            uid: userData.uid,
            email: userData.email,
            role: userData.role || "Buyer", // Default role if not specified
        },
        token,
    }));
};

// Function to clear user data when logged out
export const clearUser = () => {
    authStore.set(initialState);
};

// Function to check if the current user is a seller
export const isSeller = (): boolean => {
    let result = false;

    // One-time subscription to get the current value
    authStore.subscribe((state) => {
        result = state.isAuthenticated && state.user?.role === "Seller";
    })();

    return result;
};
