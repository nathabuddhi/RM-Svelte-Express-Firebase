<script lang="ts">
    import { onMount } from "svelte";
    import ProductManagement from "./ProductManagement.svelte";
    import { navigate } from "svelte-routing";
    import { onAuthStateChanged } from "firebase/auth";
    import { auth } from "../lib/firebase";

    let isUserSeller = false;

    onMount(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigate("/login");
                return;
            }

            const idToken = await user.getIdToken();

            try {
                const response = await fetch(
                    "http://localhost:5000/api/users/getrole",
                    {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                    }
                );

                if (!response.ok) throw new Error("Failed to get user profile");

                const data = await response.json();

                isUserSeller = data.role === "Seller";

                if (!isUserSeller) {
                    navigate("/");
                }
            } catch (err) {
                console.error("Error fetching user profile:", err);
                navigate("/login");
            }
        });

        return unsubscribe;
    });
</script>

{#if isUserSeller}
    <div class="seller-dashboard">
        <h1>Seller Dashboard</h1>
        <div class="dashboard-section">
            <ProductManagement />
        </div>
    </div>
{:else}
    <div class="loading">Loading...</div>
{/if}

<style lang="scss">
    .seller-dashboard {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;

        h1 {
            margin-bottom: 2rem;
            text-align: center;
        }

        .dashboard-section {
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
    }

    .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-size: 1.25rem;
        color: #666;
    }
</style>
