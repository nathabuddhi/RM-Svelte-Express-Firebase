export type UserRole = "Customer" | "Seller";

export interface AuthUser {
    email: string;
    role: UserRole;
}

export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterFormData extends LoginFormData {
    role: UserRole;
    confirmPassword: string;
}
