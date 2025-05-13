<!-- src/routes/seller/orders/+page.svelte -->
<script lang="ts">
    import { onMount } from "svelte";
    import OrderCard from "./OrderCard.svelte";
    import { getAuth, onAuthStateChanged } from "firebase/auth";
    import type { Order } from "../types/order";

    let orders: Order[] = [];
    let pendingOrders: Order[] = [];
    let shippedOrders: Order[] = [];
    let acceptedOrders: Order[] = [];
    let activeTab = "pending";
    let loading = true;
    let error: string | null = null;

    onMount(async () => {
        await loadOrders();
    });

    const getToken = async (): Promise<string> => {
        return new Promise((resolve, reject) => {
            const auth = getAuth();
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                unsubscribe();
                if (!user) return reject(new Error("User not authenticated"));
                try {
                    const token = await user.getIdToken();
                    resolve(token);
                } catch (err) {
                    reject(err);
                }
            });
        });
    };

    async function loadOrders() {
        try {
            loading = true;
            error = null;

            const response = await fetch(
                "http://localhost:5000/api/orders/seller-orders",
                {
                    headers: {
                        Authorization: `Bearer ${await getToken()}`,
                    },
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to load orders");
            }

            const data = await response.json();
            orders = data.orders;

            // Filter orders by status
            filterOrders();
        } catch (err) {
            console.error("Error loading orders:", err);
            error = (err as Error).message;
            alert("Failed to load orders");
        } finally {
            loading = false;
        }
    }

    function filterOrders() {
        pendingOrders = orders.filter((order) => order.status === "pending");
        acceptedOrders = orders.filter((order) => order.status === "accepted");
        shippedOrders = orders.filter((order) => order.status === "shipped");
    }

    async function updateOrderStatus(orderId: string, newStatus: string) {
        try {
            const response = await fetch(
                `http://localhost:5000/api/orders/update-status/${orderId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${await getToken()}`,
                    },
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to update order");
            }

            alert(
                `Order ${newStatus === "accepted" ? "accepted" : "shipped"} successfully`
            );

            // Update order in the list
            orders = orders.map((order) => {
                if (order.orderId === orderId) {
                    return {
                        ...order,
                        status: newStatus as
                            | "pending"
                            | "accepted"
                            | "shipped"
                            | "completed",
                        updatedAt: new Date().toISOString(),
                    } as Order;
                }
                return order;
            });

            // Refilter orders
            filterOrders();
        } catch (err) {
            console.error("Error updating order:", err);
            alert((err as Error).message);
        }
    }

    function setActiveTab(tab: string) {
        activeTab = tab;
    }
</script>

<svelte:head>
    <title>Manage Orders</title>
</svelte:head>

<div class="seller-orders-page">
    <div class="container">
        <h1>Manage Orders</h1>

        {#if loading}
            <div class="loading-container">Loading...</div>
        {:else if error}
            <div class="error-message">
                <p>{error}</p>
                <button class="btn btn-primary" on:click={loadOrders}
                    >Try Again</button
                >
            </div>
        {:else}
            <div class="order-tabs">
                <div class="tabs">
                    <button
                        class="tab-button {activeTab === 'pending'
                            ? 'active'
                            : ''}"
                        on:click={() => setActiveTab("pending")}
                    >
                        Pending Orders
                        {#if pendingOrders.length > 0}
                            <span class="badge">{pendingOrders.length}</span>
                        {/if}
                    </button>

                    <button
                        class="tab-button {activeTab === 'accepted'
                            ? 'active'
                            : ''}"
                        on:click={() => setActiveTab("accepted")}
                    >
                        Accepted Orders
                        {#if acceptedOrders.length > 0}
                            <span class="badge">{acceptedOrders.length}</span>
                        {/if}
                    </button>

                    <button
                        class="tab-button {activeTab === 'completed'
                            ? 'active'
                            : ''}"
                        on:click={() => setActiveTab("completed")}
                    >
                        Shipped/Completed Orders
                        {#if shippedOrders.length > 0}
                            <span class="badge">{shippedOrders.length}</span>
                        {/if}
                    </button>
                </div>

                <div class="tab-content">
                    {#if activeTab === "pending"}
                        {#if pendingOrders.length === 0}
                            <div class="empty-tab">
                                <p>No pending orders at the moment.</p>
                            </div>
                        {:else}
                            <div class="orders-list">
                                {#each pendingOrders as order (order.orderId)}
                                    <OrderCard
                                        {order}
                                        isCustomer={false}
                                        on:accept={() =>
                                            updateOrderStatus(
                                                order.id,
                                                "accepted"
                                            )}
                                    />
                                {/each}
                            </div>
                        {/if}
                    {:else if activeTab === "accepted"}
                        {#if filteredOrders.accepted.length === 0}
                            <div class="empty-tab">
                                <p>No accepted orders waiting to be shipped.</p>
                            </div>
                        {:else}
                            <div class="orders-list">
                                {#each filteredOrders.accepted as order (order.id)}
                                    <OrderCard
                                        {order}
                                        isCustomer={false}
                                        on:ship={() =>
                                            updateOrderStatus(
                                                order.id,
                                                "shipped"
                                            )}
                                    />
                                {/each}
                            </div>
                        {/if}
                    {:else if filteredOrders.completed.length === 0}
                        <div class="empty-tab">
                            <p>No shipped or completed orders yet.</p>
                        </div>
                    {:else}
                        <div class="orders-list">
                            {#each filteredOrders.completed as order (order.id)}
                                <OrderCard {order} isCustomer={false} />
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
</div>

<style lang="scss">
    .seller-orders-page {
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

        .order-tabs {
            .tabs {
                display: flex;
                border-bottom: 1px solid #ddd;
                margin-bottom: 1.5rem;

                .tab-button {
                    padding: 0.75rem 1.25rem;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1rem;
                    position: relative;

                    &.active {
                        font-weight: 600;
                        color: #1976d2;
                        border-bottom: 2px solid #1976d2;
                    }

                    .badge {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        min-width: 20px;
                        height: 20px;
                        border-radius: 10px;
                        background-color: #f44336;
                        color: white;
                        font-size: 0.8rem;
                        margin-left: 0.5rem;
                        padding: 0 0.4rem;
                    }
                }
            }

            .tab-content {
                min-height: 300px;
            }
        }

        .empty-tab {
            padding: 3rem 0;
            text-align: center;
            color: #666;
        }

        .orders-list {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
    }
</style>
