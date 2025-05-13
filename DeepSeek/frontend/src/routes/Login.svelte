<script lang="ts">
    import { auth } from "../firebase";
    import { loginWithEmailAndPassword, getUserRole } from "../firebase";
    import { navigate } from "svelte-routing";
    import type { LoginFormData } from "../types/auth";

    let formData: LoginFormData = {
        email: "",
        password: "",
    };

    let error: string | null = null;
    let isLoading = false;

    const handleLogin = async () => {
        if (!formData.email || !formData.password) {
            error = "Please fill in all fields";
            return;
        }

        isLoading = true;
        error = null;

        try {
            const userCredential = await loginWithEmailAndPassword(
                formData.email,
                formData.password
            );
            const role = await getUserRole(userCredential.user.uid);

            if (role === "Seller") {
                navigate("/seller-dashboard");
            } else {
                navigate("/");
            }
        } catch (err) {
            console.error(err);
            error = "Invalid email or password";
        } finally {
            isLoading = false;
        }
    };
</script>

<svelte:head>
    <title>Login</title>
</svelte:head>

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
                placeholder="Enter your password"
            />
        </div>

        <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
        </button>
    </form>

    <p>
        Don't have an account? <a href="/register">Register here</a>
    </p>
</div>

<style lang="scss">
    .auth-container {
        max-width: 400px;
        margin: 2rem auto;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        background: white;

        h1 {
            text-align: center;
            margin-bottom: 1.5rem;
            color: #333;
        }

        .error-message {
            color: #e74c3c;
            background: #fdecea;
            padding: 0.75rem;
            border-radius: 4px;
            margin-bottom: 1rem;
            font-size: 0.9rem;
        }

        .form-group {
            margin-bottom: 1.25rem;

            label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
                color: #555;
            }

            input {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 1rem;

                &:focus {
                    outline: none;
                    border-color: #3498db;
                }
            }
        }

        button {
            width: 100%;
            padding: 0.75rem;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.2s;

            &:hover {
                background: #2980b9;
            }

            &:disabled {
                background: #bdc3c7;
                cursor: not-allowed;
            }
        }

        p {
            text-align: center;
            margin-top: 1.5rem;
            color: #666;

            a {
                color: #3498db;
                text-decoration: none;

                &:hover {
                    text-decoration: underline;
                }
            }
        }
    }
</style>
