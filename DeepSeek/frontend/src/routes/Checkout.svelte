<script lang="ts">
    import { submitOrder } from "../services/orderService";
    import { navigate } from "svelte-routing";
    import type { CheckoutFormData } from "../types/order";
    import { auth } from "../firebase";
    import { onMount } from "svelte";

    onMount(() => {
        if (!auth.currentUser) {
            navigate("/login");
        }
    });

    let formData: CheckoutFormData = {
        paymentMethod: "Credit Card",
        shippingAddress: "",
    };

    let loading = false;
    let error: string | null = null;
    let success: string | null = null;
    let orderId: string | null = null;

    const paymentMethods = [
        "Credit Card",
        "PayPal",
        "Bank Transfer",
        "Cash on Delivery",
    ];

    const handleSubmit = async () => {
        if (!formData.shippingAddress.trim()) {
            error = "Shipping address is required";
            return;
        }

        loading = true;
        error = null;
        success = null;

        try {
            const result = await submitOrder(formData);
            orderId = result.orderId;
            success = "Order placed successfully!";
        } catch (err) {
            error =
                err instanceof Error ? err.message : "Failed to place order";
        } finally {
            loading = false;
        }
    };

    const goToOrders = () => {
        navigate("/orders");
    };
</script>

<svelte:head>
    <title>Checkout</title>
</svelte:head>

<div class="checkout-container">
    <h1>Checkout</h1>

    {#if error}
        <div class="alert error">{error}</div>
    {/if}

    {#if success}
        <div class="alert success">
            {success}
            {#if orderId}
                <p>Order ID: {orderId}</p>
                <button on:click={goToOrders} class="btn primary">
                    View Your Orders
                </button>
            {/if}
        </div>
    {:else}
        <form on:submit|preventDefault={handleSubmit} class="checkout-form">
            <div class="form-group">
                <label for="paymentMethod">Payment Method</label>
                <select
                    id="paymentMethod"
                    bind:value={formData.paymentMethod}
                    class="form-control"
                >
                    {#each paymentMethods as method}
                        <option value={method}>{method}</option>
                    {/each}
                </select>
            </div>

            <div class="form-group">
                <label for="shippingAddress">Shipping Address</label>
                <textarea
                    id="shippingAddress"
                    bind:value={formData.shippingAddress}
                    class="form-control"
                    rows="4"
                    placeholder="Enter your complete shipping address"
                    required
                ></textarea>
            </div>

            <button type="submit" disabled={loading} class="btn primary">
                {loading ? "Processing..." : "Place Order"}
            </button>
        </form>
    {/if}
</div>

<style lang="scss">
    .checkout-container {
        max-width: 600px;
        margin: 2rem auto;
        padding: 2rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

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

            &.success {
                background: #e8f5e9;
                color: #2e7d32;

                p {
                    margin: 0.5rem 0;
                    font-weight: bold;
                }

                button {
                    margin-top: 1rem;
                }
            }
        }

        .checkout-form {
            .form-group {
                margin-bottom: 1.5rem;

                label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                    color: #555;
                }

                .form-control {
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

                select.form-control {
                    height: auto;
                }

                textarea.form-control {
                    min-height: 100px;
                    resize: vertical;
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
        }
    }
</style>
