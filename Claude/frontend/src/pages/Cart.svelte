<!-- Cart.svelte -->
<script lang="ts">
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";
    import { getAuth } from "firebase/auth";
    import CartItem from "./CartItem.svelte";
    import type { CartItem as CartItemType } from "../types/cart";
    import "../styles/cart.scss";

    const CART_URL =  "http://localhost:5000/api/cart";

    let cartItems: CartItemType[] = [];
    let isLoading = true;
    let error = "";
    let success = "";
    let totalPrice = 0;

    onMount(async () => {
        await fetchCartItems();
    });

    async function fetchCartItems() {
        isLoading = true;
        error = "";

        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                navigate("/login", { state: { redirectTo: "/cart" } });
                return;
            }

            const idToken = await user.getIdToken();

            const response = await fetch(CART_URL, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to fetch cart items");
            }

            const data = await response.json();
            cartItems = data.items;
            calculateTotal();
        } catch (err) {
            error =
                err instanceof Error
                    ? err.message
                    : "Unexpected error occurred";
        } finally {
            isLoading = false;
        }
    }

    async function handleUpdateQuantity(
        productId: string,
        newQuantity: number
    ) {
        error = "";
        success = "";

        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                navigate("/login", { state: { redirectTo: "/cart" } });
                return;
            }

            const idToken = await user.getIdToken();

            const response = await fetch(CART_URL, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    productId,
                    quantity: newQuantity,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to update cart");
            }

            // Update local cartItems
            cartItems = cartItems.map((item) => {
                if (item.productId === productId) {
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });

            calculateTotal();
            success = "Cart updated successfully";
        } catch (err) {
            error =
                err instanceof Error
                    ? err.message
                    : "Unexpected error occurred";
        }
    }

    async function handleRemoveItem(productId: string) {
        error = "";
        success = "";

        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                navigate("/login", { state: { redirectTo: "/cart" } });
                return;
            }

            const idToken = await user.getIdToken();

            const response = await fetch(`${CART_URL}/${productId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(
                    data.error || "Failed to remove item from cart"
                );
            }

            // Remove item from local cartItems
            cartItems = cartItems.filter(
                (item) => item.productId !== productId
            );
            calculateTotal();
            success = "Item removed from cart";
        } catch (err) {
            error =
                err instanceof Error
                    ? err.message
                    : "Unexpected error occurred";
        }
    }

    async function handleCheckout() {
        error = "";
        success = "";

        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                navigate("/login", { state: { redirectTo: "/cart" } });
                return;
            }

            const idToken = await user.getIdToken();

            const response = await fetch(`${CART_URL}/checkout`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to checkout");
            }

            // Clear cart and show success
            cartItems = [];
            totalPrice = 0;
            success = "Checkout successful! Your order has been placed.";
        } catch (err) {
            error =
                err instanceof Error
                    ? err.message
                    : "Unexpected error occurred";
        }
    }

    function calculateTotal() {
        totalPrice = cartItems.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);
    }
</script>

<svelte:head>
    <title>Your Cart</title>
</svelte:head>

<div class="cart-container">
    <h1>Your Shopping Cart</h1>

    {#if error}
        <div class="error-message">
            {error}
        </div>
    {/if}

    {#if success}
        <div class="success-message">
            {success}
        </div>
    {/if}

    {#if isLoading}
        <div class="loading">Loading your cart...</div>
    {:else if cartItems.length === 0}
        <div class="empty-cart">
            <p>Your cart is empty.</p>
            <a href="/products" class="continue-shopping">Continue Shopping</a>
        </div>
    {:else}
        <div class="cart-items">
            {#each cartItems as item (item.productId)}
                <CartItem
                    {item}
                    onUpdateQuantity={(newQuantity) =>
                        handleUpdateQuantity(item.productId, newQuantity)}
                    onRemove={() => handleRemoveItem(item.productId)}
                />
            {/each}
        </div>

        <div class="cart-summary">
            <div class="total">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
            </div>

            <div class="cart-actions">
                <a href="/products" class="continue-shopping"
                    >Continue Shopping</a
                >
                <button class="checkout-button" on:click={handleCheckout}>
                    Proceed to Checkout
                </button>
            </div>
        </div>
    {/if}
</div>
