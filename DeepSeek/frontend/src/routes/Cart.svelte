<script lang="ts">
    import { onMount } from "svelte";
    import {
        getCart,
        addOrUpdateCartItem,
        deleteCartItem,
        type CartItem,
    } from "../services/cartService";

    let cart: CartItem[] = [];
    let loading = true;
    let error: string | null = null;
    let success: string | null = null;

    onMount(() => {
        loadCart();
    });

    const loadCart = async () => {
        try {
            loading = true;
            cart = await getCart();
            error = null;
        } catch (err) {
            error = err instanceof Error ? err.message : "Failed to load cart";
        } finally {
            loading = false;
        }
    };

    const updateQuantity = async (item: CartItem, newQty: number) => {
        if (newQty < 1 || newQty > item.product.productStock) return;
        try {
            await addOrUpdateCartItem(item.productId, newQty);
            item.quantity = newQty;
            success = "Cart updated";
            error = null;
        } catch (err) {
            error =
                err instanceof Error ? err.message : "Failed to update cart";
            success = null;
        }
    };

    const removeItem = async (productId: string) => {
        try {
            await deleteCartItem(productId);
            cart = cart.filter((item) => item.productId !== productId);
            success = "Item removed";
            error = null;
        } catch (err) {
            error =
                err instanceof Error ? err.message : "Failed to remove item";
            success = null;
        }
    };

    const checkout = () => {
        alert("Checkout functionality coming next!");
    };
</script>

<div class="cart-container">
    <h1>Your Cart</h1>

    {#if error}
        <div class="alert error">{error}</div>
    {/if}

    {#if success}
        <div class="alert success">{success}</div>
    {/if}

    {#if loading}
        <p>Loading...</p>
    {:else if cart.length === 0}
        <p>Your cart is empty.</p>
    {:else}
        <table class="cart-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each cart as item (item.productId)}
                    <tr>
                        <td>{item.product.productName}</td>
                        <td>${item.product.productPrice.toFixed(2)}</td>
                        <td>
                            <input
                                type="number"
                                min="1"
                                max={item.product.productStock}
                                bind:value={item.quantity}
                                on:change={(e) =>
                                    updateQuantity(item, +((e.target as HTMLInputElement)?.value || item.quantity))}
                            />
                        </td>
                        <td
                            >${(
                                item.quantity * item.product.productPrice
                            ).toFixed(2)}</td
                        >
                        <td class="actions">
                            <button
                                on:click={() => removeItem(item.productId)}
                                class="btn danger"
                            >
                                Remove
                            </button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>

        <button class="btn primary" on:click={checkout}>Checkout</button>
    {/if}
</div>

<style lang="scss">
    .cart-container {
        padding: 1rem;
        max-width: 800px;
        margin: auto;
    }
    .cart-table {
        width: 100%;
        border-collapse: collapse;
    }
    .cart-table th,
    .cart-table td {
        padding: 0.5rem;
        border-bottom: 1px solid #ddd;
    }
    .actions button {
        margin: 0 0.25rem;
    }
</style>
