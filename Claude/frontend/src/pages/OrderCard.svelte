<!-- src/lib/components/orders/OrderCard.svelte -->
<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let order;
    export let isCustomer = false;

    const dispatch = createEventDispatcher();

    // Calculate total price
    $: totalPrice = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    // Format date
    function formatDate(timestamp: Date) {
        if (!timestamp) return "Processing";

        const date =
            typeof timestamp === "string"
                ? new Date(timestamp)
                : timestamp.toDate
                  ? timestamp.toDate()
                  : new Date();

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    // Get status badge color
    function getStatusColor(status) {
        switch (status) {
            case "pending":
                return "badge-warning";
            case "accepted":
                return "badge-info";
            case "shipped":
                return "badge-primary";
            case "completed":
                return "badge-success";
            default:
                return "badge-secondary";
        }
    }

    // Get status text
    function getStatusText(status: string) {
        switch (status) {
            case "pending":
                return "Pending";
            case "accepted":
                return "Accepted";
            case "shipped":
                return "Shipped";
            case "completed":
                return "Completed";
            default:
                return status;
        }
    }

    function handleAccept() {
        dispatch("accept");
    }

    function handleShip() {
        dispatch("ship");
    }

    function handleConfirmReceived() {
        dispatch("confirmReceived");
    }
</script>

<div class="order-card">
    <div class="order-header">
        <div class="order-info">
            <span class="order-id">Order #{order.orderId.slice(0, 8)}</span>
            <span class="order-date"
                >Placed on {formatDate(order.createdAt)}</span
            >
        </div>
        <div class="order-status">
            <span class="badge {getStatusColor(order.status)}">
                {getStatusText(order.status)}
            </span>
        </div>
    </div>

    <div class="order-items">
        {#each order.items as item}
            <div class="order-item">
                <div class="item-info">
                    <h4>{item.productName}</h4>
                    <div class="item-details">
                        <span>Quantity: {item.quantity}</span>
                        <span>${item.price.toFixed(2)} each</span>
                    </div>
                </div>
                <div class="item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                </div>
            </div>
        {/each}
    </div>

    <div class="order-footer">
        <div class="order-total">
            <span>Total</span>
            <span class="total-price">${totalPrice.toFixed(2)}</span>
        </div>

        <div class="order-actions">
            {#if isCustomer}
                {#if order.status === "shipped"}
                    <button
                        class="btn btn-success"
                        on:click={handleConfirmReceived}
                    >
                        Mark as Received
                    </button>
                {/if}
            {:else if order.status === "pending"}
                <button class="btn btn-primary" on:click={handleAccept}>
                    Accept Order
                </button>
            {:else if order.status === "accepted"}
                <button class="btn btn-primary" on:click={handleShip}>
                    Mark as Shipped
                </button>
            {/if}
        </div>
    </div>

    {#if !isCustomer}
        <div class="customer-info">
            <h4>Customer Details</h4>
            <span>{order.userEmail}</span>
        </div>
    {/if}
</div>

<style lang="scss">
    .order-card {
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;

        .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.25rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #eee;

            .order-info {
                display: flex;
                flex-direction: column;

                .order-id {
                    font-weight: 600;
                    font-size: 1.1rem;
                }

                .order-date {
                    color: #666;
                    font-size: 0.95rem;
                    margin-top: 0.25rem;
                }
            }

            .order-status {
                .badge {
                    padding: 0.4rem 0.8rem;
                    border-radius: 100px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    text-transform: uppercase;

                    &.badge-warning {
                        background-color: #fff3cd;
                        color: #856404;
                    }

                    &.badge-info {
                        background-color: #d1ecf1;
                        color: #0c5460;
                    }

                    &.badge-primary {
                        background-color: #cce5ff;
                        color: #004085;
                    }

                    &.badge-success {
                        background-color: #d4edda;
                        color: #155724;
                    }

                    &.badge-secondary {
                        background-color: #e2e3e5;
                        color: #383d41;
                    }
                }
            }
        }

        .order-items {
            margin-bottom: 1.5rem;

            .order-item {
                display: flex;
                justify-content: space-between;
                padding: 1rem 0;
                border-bottom: 1px solid #f5f5f5;

                &:first-child {
                    padding-top: 0;
                }

                &:last-child {
                    border-bottom: none;
                }

                .item-info {
                    flex: 1;

                    h4 {
                        margin: 0 0 0.5rem 0;
                        font-size: 1rem;
                        font-weight: 500;
                    }

                    .item-details {
                        display: flex;
                        color: #666;
                        font-size: 0.9rem;

                        span {
                            margin-right: 1rem;
                        }
                    }
                }

                .item-price {
                    font-weight: 600;
                    font-size: 1.1rem;
                }
            }
        }

        .order-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 1rem;
            border-top: 1px solid #eee;

            .order-total {
                display: flex;
                flex-direction: column;

                span {
                    font-weight: 500;
                    color: #666;
                }

                .total-price {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #333;
                    margin-top: 0.25rem;
                }
            }

            .order-actions {
                display: flex;
                gap: 0.5rem;

                .btn {
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    font-weight: 500;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s ease;

                    &.btn-primary {
                        background-color: #1976d2;
                        color: white;

                        &:hover {
                            background-color: #1565c0;
                        }
                    }

                    &.btn-success {
                        background-color: #43a047;
                        color: white;

                        &:hover {
                            background-color: #388e3c;
                        }
                    }
                }
            }
        }

        .customer-info {
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid #eee;

            h4 {
                margin: 0 0 0.5rem 0;
                font-size: 1rem;
                font-weight: 500;
            }

            span {
                color: #666;
            }
        }
    }
</style>
