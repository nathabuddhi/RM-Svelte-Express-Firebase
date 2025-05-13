<script lang="ts">
    import { onMount } from "svelte";
    import { authStore, isSeller } from "../stores/authStore";
    import ProductManagement from "./ProductManagement.svelte";
    import { navigate } from "svelte-routing";

    let isUserSeller = false;

    onMount(() => {
        // Subscribe to auth changes to check user role
        const unsubscribe = authStore.subscribe((state) => {
            if (!state.isAuthenticated) {
                // Redirect to login if not authenticated
                // navigate("/login");
                // return;
            }

            isUserSeller = state.user?.role === "Seller";

            if (!isUserSeller) {
                // Redirect to home if not a seller
                // navigate("/");
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
