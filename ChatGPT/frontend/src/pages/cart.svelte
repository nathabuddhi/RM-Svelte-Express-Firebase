<script lang="ts">
    import { auth } from "../lib/firebase";
    import { onMount } from "svelte";

    let email = "";
    let cart: any[] = [];
    let message = "";

    async function loadCart() {
        message = "";
        const res = await fetch(`http://localhost:5000/api/cart/${email}`);
        cart = await res.json();
    }

    async function updateQuantity(productId: string, quantity: number) {
        if (quantity < 1) return;
        const item = cart.find((p) => p.productId === productId);
        if (quantity > item.productStock) {
            message = "Quantity exceeds stock.";
            return;
        }

        const res = await fetch(
            `http://localhost:5000/api/cart/${email}/${productId}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity }),
            }
        );
        const data = await res.json();
        message = data.message || data.error;
        await loadCart();
    }

    async function removeItem(productId: string) {
        await fetch(`http://localhost:5000/api/cart/${email}/${productId}`, {
            method: "DELETE",
        });
        await loadCart();
    }

    async function checkout() {
        alert("Checkout functionality coming soon!");
    }

    onMount(() => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                email = user.email!;
                loadCart();
            }
        });
    });
</script>

<h2>Your Shopping Cart</h2>

{#if message}
    <p
        class={message.includes("fail") || message.includes("exceed")
            ? "error"
            : "success"}
    >
        {message}
    </p>
{/if}

{#each cart as item}
    <div class="cart-item">
        {#if item.productImages?.[0]}
            <img src={item.productImages[0]} alt={item.productName} />
        {/if}
        <div>
            <h3>{item.productName}</h3>
            <p>{item.productDescription}</p>
            <p>Price: ${item.productPrice}</p>
            <p>Stock: {item.productStock}</p>

            <label>
                Quantity:
                <input
                    type="number"
                    min="1"
                    max={item.productStock}
                    bind:value={item.quantity}
                    on:change={(e) =>
                        updateQuantity(
                            item.productId,
                            parseInt((e.target as HTMLInputElement).value)
                        )}
                />
            </label>

            <div class="actions">
                <button on:click={() => removeItem(item.productId)}
                    >Remove</button
                >
            </div>
        </div>
    </div>
{/each}

{#if cart.length > 0}
    <button on:click={checkout}>Checkout</button>
{:else}
    <p>Your cart is empty.</p>
{/if}

<style lang="scss">
    .cart-item {
        border: 1px solid #ddd;
        padding: 1rem;
        margin-bottom: 1rem;
        display: flex;
        gap: 1rem;
    }

    .cart-item img {
        width: 100px;
        height: auto;
    }

    .actions {
        margin-top: 1rem;
    }

    .error {
        color: red;
    }

    .success {
        color: green;
    }
</style>
