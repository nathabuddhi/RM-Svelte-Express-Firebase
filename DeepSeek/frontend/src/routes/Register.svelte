<script lang="ts">
    import { registerWithEmailAndPassword } from "../firebase";
    import { navigate } from "svelte-routing";
    import type { RegisterFormData, UserRole } from "../types/auth";

    let formData: RegisterFormData = {
        email: "",
        password: "",
        confirmPassword: "",
        role: "Customer" as UserRole,
    };

    let error: string | null = null;
    let isLoading = false;

    const handleRegister = async () => {
        if (
            !formData.email ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            error = "Please fill in all fields";
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            error = "Passwords do not match";
            return;
        }

        if (formData.password.length < 6) {
            error = "Password must be at least 6 characters";
            return;
        }

        isLoading = true;
        error = null;

        try {
            await registerWithEmailAndPassword(
                formData.email,
                formData.password,
                formData.role
            );
            navigate(formData.role === "Seller" ? "/seller-dashboard" : "/");
        } catch (err) {
            console.error(err);
            if (
                (err as { code: string }).code === "auth/email-already-in-use"
            ) {
                error = "Email already in use";
            } else {
                error = "Registration failed. Please try again.";
            }
        } finally {
            isLoading = false;
        }
    };
</script>

<svelte:head>
    <title>Register</title>
</svelte:head>

<div class="auth-container">
    <h1>Register</h1>

    {#if error}
        <div class="error-message">{error}</div>
    {/if}

    <form on:submit|preventDefault={handleRegister}>
        <div class="form-group">
            <label for="email">Email</label>
            <input
                type="email"
                id="email"
                bind:value={formData.email}
                placeholder="Enter your email"
            />
        </div>

        <div class="form-group">
            <label for="password">Password</label>
            <input
                type="password"
                id="password"
                bind:value={formData.password}
                placeholder="Enter your password (min 6 characters)"
            />
        </div>

        <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
                type="password"
                id="confirmPassword"
                bind:value={formData.confirmPassword}
                placeholder="Confirm your password"
            />
        </div>

        <div class="form-group">
            <p>Role</p>
            <div class="role-options">
                <label>
                    <input
                        type="radio"
                        name="role"
                        value="Customer"
                        bind:group={formData.role}
                    />
                    Customer
                </label>
                <label>
                    <input
                        type="radio"
                        name="role"
                        value="Seller"
                        bind:group={formData.role}
                    />
                    Seller
                </label>
            </div>
        </div>

        <button type="submit" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
        </button>
    </form>

    <p>
        Already have an account? <a href="/login">Login here</a>
    </p>
</div>

<style lang="scss">
    .auth-container {
        /* Same styles as Login.svelte */
        /* ... */

        .role-options {
            display: flex;
            gap: 1rem;
            margin-top: 0.5rem;

            label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-weight: normal;
                cursor: pointer;

                input {
                    width: auto;
                }
            }
        }
    }
</style>
