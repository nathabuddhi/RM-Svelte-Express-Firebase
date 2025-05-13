<!-- frontend/src/routes/Login.svelte -->
<script lang="ts">
    import { signInWithEmailAndPassword } from "firebase/auth";
    import { auth } from "../lib/firebase";
    import "../styles/auth.scss";
    import { navigate } from "svelte-routing";

    let email: string = "";
    let password: string = "";
    let loading: boolean = false;
    let error: string = "";

    async function handleLogin() {
        // Reset error message
        error = "";

        // Simple validation
        if (!email || !password) {
            error = "Email and password are required";
            return;
        }

        try {
            loading = true;

            // Sign in with Firebase Auth
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;

            // Get the Firebase ID token for backend authentication
            const idToken = await user.getIdToken();

            // Get user role from backend
            const response = await fetch(
                "http://localhost:5000/api/users/profile",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to get user profile");
            }

            const userData = await response.json();

            // Redirect based on user role
            if (userData.role === "Customer") {
                navigate("/customer/dashboard", { replace: true });
            } else if (userData.role === "Seller") {
                navigate("/seller/dashboard", { replace: true });
            } else {
                // Default redirect if role is not recognized
                navigate("/dashboard", { replace: true });
            }
        } catch (err) {
            if (err instanceof Error) {
                // Handle Firebase Auth specific errors
                if (
                    err.message.includes("auth/wrong-password") ||
                    err.message.includes("auth/user-not-found")
                ) {
                    error = "Invalid email or password";
                } else {
                    error = err.message;
                }
            } else {
                error = "An unexpected error occurred";
            }
        } finally {
            loading = false;
        }
    }
</script>

<div class="auth-container">
    <h1>Login</h1>

    {#if error}
        <div class="error-message">{error}</div>
    {/if}

    <form on:submit|preventDefault={handleLogin}>
        <div class="form-group">
            <label for="email">Email</label>
            <input
                type="email"
                id="email"
                bind:value={email}
                placeholder="Enter your email"
                required
            />
        </div>

        <div class="form-group">
            <label for="password">Password</label>
            <input
                type="password"
                id="password"
                bind:value={password}
                placeholder="Enter your password"
                required
            />
        </div>

        <button type="submit" class="btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
        </button>
    </form>

    <div class="switch-form">
        Don't have an account? <a href="/register">Register</a>
    </div>
</div>
