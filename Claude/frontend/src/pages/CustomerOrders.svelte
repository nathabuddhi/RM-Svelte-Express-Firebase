<script lang="ts">
    import { onMount } from "svelte";
    import { onAuthStateChanged } from "firebase/auth";
    import { auth } from "../lib/firebase"; // adjust the path as needed
    import OrderCard from "/OrderCard.svelte";

    let orders = [];
    let loading = true;
    let error: string | null = null;
    let idToken = "";

    onMount(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                idToken = await user.getIdToken();
                await loadOrders();
            } else {
                error = "You must be logged in to view orders.";
                alert(error);
            }
        });
    });

    async function loadOrders() {
        try {
            loading = true;
            error = null;

            const response = await fetch(
                "http://localhost:5000/api/cart/customer-orders",
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to load orders");
            }

            const data = await response.json();
            orders = data.orders;
        } catch (err) {
            console.error("Error loading orders:", err);
            error = err instanceof Error ? err.message : "Unknown error";
            alert("Failed to load orders: " + error);
        } finally {
            loading = false;
        }
    }

    async function confirmOrderReceived(orderId: string) {
        try {
            const response = await fetch(
                `http://localhost:5000/api/cart/update-status/${orderId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({ status: "completed" }),
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to update order");
            }

            alert("Order marked as received");

            // Update order in local state
            orders = orders.map((order) => {
                if (order.id === orderId) {
                    return {
                        ...order,
                        status: "completed",
                        updatedAt: new Date().toISOString(),
                    };
                }
                return order;
            });
        } catch (err) {
            console.error("Error updating order:", err);
            alert(err instanceof Error ? err.message : "Unexpected error");
        }
    }
</script>

<svelte:head>
    <title>My Orders</title>
</svelte:head>

<div class="orders-page">
    <div class="container">
        <h1>My Orders</h1>

        {#if loading}
            <div class="loading-container">Loading</div>
        {:else if error}
            <div class="error-message">
                <p>{error}</p>
                <button class="btn btn-primary" on:click={loadOrders}>
                    Try Again
                </button>
            </div>
        {:else if orders.length === 0}
            <div class="empty-state">
                <p>You haven't placed any orders yet.</p>
                <a href="/products" class="btn btn-primary">Browse Products</a>
            </div>
        {:else}
            <div class="orders-list">
                {#each orders as order (order.id)}
                    <OrderCard
                        {order}
                        isCustomer={true}
                        on:confirmReceived={() =>
                            confirmOrderReceived(order.id)}
                    />
                {/each}
            </div>
        {/if}
    </div>
</div>

<style lang="scss">
    .orders-page {
        padding: 2rem 0;

        h1 {
            margin-bottom: 2rem;
            font-weight: 600;
        }

        .loading-container {
            display: flex;
            justify-content: center;
            padding: 3rem 0;
        }

        .error-message {
            background-color: #ffebee;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            text-align: center;

            p {
                margin-bottom: 1rem;
                color: #c62828;
            }
        }

        .empty-state {
            background-color: #f5f5f5;
            padding: 2rem;
            border-radius: 8px;
            text-align: center;

            p {
                margin-bottom: 1rem;
                font-size: 1.1rem;
            }
        }

        .orders-list {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
    }
</style>
