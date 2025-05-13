<script lang="ts">
    import { onMount } from "svelte";
    import { auth } from "../firebase";
    import {
        getOrders,
        updateOrderStatus,
        completeOrder,
    } from "../services/orderService";
    import type { Order, OrderStatus } from "../types/order";

    let orders: Order[] = [];
    let loading = true;
    let error: string | null = null;
    let activeTab: OrderStatus | "all" = "all";
    let userRole: "Customer" | "Seller" = "Customer";

    onMount(async () => {
        // if (!auth.currentUser) {
        //     goto("/login?redirect=/orders");
        //     return;
        // }

        try {
            // In a real app, you'd get this from your auth state or user profile
            userRole = await getUserRole(); // Implement this based on your auth system
            await loadOrders();
        } catch (err) {
            error =
                err instanceof Error ? err.message : "Failed to load orders";
        }
    });

    async function getUserRole(): Promise<"Customer" | "Seller"> {
        // Implement based on how you store user roles
        return "Customer"; // Default for example
    }

    const loadOrders = async () => {
        try {
            loading = true;
            error = null;
            orders = await getOrders();
        } catch (err) {
            error =
                err instanceof Error ? err.message : "Failed to load orders";
        } finally {
            loading = false;
        }
    };

    const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
        try {
            await updateOrderStatus(orderId, status);
            await loadOrders();
        } catch (err) {
            error =
                err instanceof Error
                    ? err.message
                    : "Failed to update order status";
        }
    };

    const handleCompleteOrder = async (orderId: string) => {
        try {
            await completeOrder(orderId);
            await loadOrders();
        } catch (err) {
            error =
                err instanceof Error ? err.message : "Failed to complete order";
        }
    };

    const filteredOrders = () => {
        if (activeTab === "all") return orders;
        return orders.filter((order) => order.status === activeTab);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString();
    };
</script>

<svelte:head>
    <title>My Orders</title>
</svelte:head>

<div class="orders-container">
    <h1>{userRole === "Seller" ? "Order Management" : "My Orders"}</h1>

    {#if error}
        <div class="alert error">{error}</div>
    {/if}

    {#if userRole === "Seller"}
        <div class="tabs">
            <button
                class:active={activeTab === "Pending"}
                on:click={() => (activeTab = "Pending")}
            >
                Pending
            </button>
            <button
                class:active={activeTab === "Accepted"}
                on:click={() => (activeTab = "Accepted")}
            >
                Accepted
            </button>
            <button
                class:active={activeTab === "Shipped"}
                on:click={() => (activeTab = "Shipped")}
            >
                Shipped
            </button>
            <button
                class:active={activeTab === "Completed"}
                on:click={() => (activeTab = "Completed")}
            >
                Completed
            </button>
        </div>
    {:else}
        <div class="tabs">
            <button
                class:active={activeTab === "all"}
                on:click={() => (activeTab = "all")}
            >
                All Orders
            </button>
        </div>
    {/if}

    {#if loading}
        <div class="loading">Loading orders...</div>
    {:else if filteredOrders().length === 0}
        <div class="empty">No orders found</div>
    {:else}
        <div class="orders-list">
            {#each filteredOrders() as order (order.orderId)}
                <div class={`order-card status-${order.status.toLowerCase()}`}>
                    <div class="order-header">
                        <h3>Order #{order.orderId.substring(0, 8)}</h3>
                        <span class="status">{order.status}</span>
                        <span class="date">{formatDate(order.timestamp)}</span>
                    </div>

                    <div class="order-details">
                        <div class="items">
                            <h4>Items:</h4>
                            <ul>
                                {#each order.items as item (item.productId)}
                                    <li>
                                        {item.productName} × {item.quantity} - ${(
                                            item.price * item.quantity
                                        ).toFixed(2)}
                                    </li>
                                {/each}
                            </ul>
                        </div>

                        <div class="summary">
                            <p>
                                <strong>Total:</strong> ${order.total.toFixed(
                                    2
                                )}
                            </p>
                            <p>
                                <strong>Payment Method:</strong>
                                {order.paymentMethod}
                            </p>
                            <p>
                                <strong>Shipping Address:</strong>
                                {order.shippingAddress}
                            </p>
                        </div>
                    </div>

                    {#if userRole === "Seller"}
                        <div class="order-actions">
                            {#if order.status === "Pending"}
                                <button
                                    on:click={() =>
                                        handleStatusUpdate(
                                            order.orderId,
                                            "Accepted"
                                        )}
                                >
                                    Accept Order
                                </button>
                            {/if}

                            {#if order.status === "Accepted"}
                                <button
                                    on:click={() =>
                                        handleStatusUpdate(
                                            order.orderId,
                                            "Shipped"
                                        )}
                                >
                                    Mark as Shipped
                                </button>
                            {/if}
                        </div>
                    {:else}
                        <div class="order-actions">
                            {#if order.status === "Shipped"}
                                <button
                                    on:click={() =>
                                        handleCompleteOrder(order.orderId)}
                                >
                                    Confirm Received
                                </button>
                            {/if}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</div>

<style lang="scss">
    .orders-container {
        max-width: 1000px;
        margin: 2rem auto;
        padding: 0 1rem;

        h1 {
            text-align: center;
            margin-bottom: 2rem;
            color: #333;
        }

        .alert {
            padding: 1rem;
            border-radius: 4px;
            margin-bottom: 1.5rem;
            text-align: center;

            &.error {
                background: #fdecea;
                color: #e74c3c;
            }
        }

        .tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 2rem;
            overflow-x: auto;
            padding-bottom: 0.5rem;

            button {
                padding: 0.75rem 1.5rem;
                background: #f5f5f5;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;
                white-space: nowrap;

                &:hover {
                    background: #e0e0e0;
                }

                &.active {
                    background: #3498db;
                    color: white;
                }
            }
        }

        .loading,
        .empty {
            text-align: center;
            padding: 2rem;
            color: #666;
        }

        .orders-list {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .order-card {
            border-radius: 8px;
            padding: 1.5rem;
            background: white;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

            &.status-pending {
                border-left: 4px solid #f39c12;
            }

            &.status-accepted {
                border-left: 4px solid #3498db;
            }

            &.status-shipped {
                border-left: 4px solid #9b59b6;
            }

            &.status-completed {
                border-left: 4px solid #2ecc71;
            }

            .order-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                flex-wrap: wrap;
                gap: 1rem;

                h3 {
                    margin: 0;
                    font-size: 1.2rem;
                }

                .status {
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    background: #f5f5f5;
                }

                .date {
                    color: #666;
                    font-size: 0.9rem;
                }
            }

            .order-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
                margin-bottom: 1.5rem;

                @media (max-width: 768px) {
                    grid-template-columns: 1fr;
                }

                .items {
                    ul {
                        list-style: none;
                        padding: 0;
                        margin: 0.5rem 0 0 0;

                        li {
                            padding: 0.5rem 0;
                            border-bottom: 1px solid #eee;

                            &:last-child {
                                border-bottom: none;
                            }
                        }
                    }
                }

                .summary {
                    p {
                        margin: 0.5rem 0;
                    }
                }
            }

            .order-actions {
                display: flex;
                justify-content: flex-end;
                gap: 1rem;

                button {
                    padding: 0.5rem 1.5rem;
                    background: #3498db;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background 0.2s;

                    &:hover {
                        background: #2980b9;
                    }
                }
            }
        }
    }
</style>
