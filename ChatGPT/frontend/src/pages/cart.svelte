<script lang="ts">
    import { auth } from "../lib/firebase";
    import { onMount } from "svelte";

    let email = "";
    let cart: any[] = [];
    let message = "";
    let paymentMethod = "";
    let shippingAddress = "";
    let checkoutMessage = "";

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
        if (!paymentMethod || !shippingAddress) {
            checkoutMessage =
                "Please provide both payment method and shipping address.";
            return;
        }

        try {
            const res = await fetch(
                `http://localhost:5000/api/checkout/${email}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentMethod, shippingAddress }),
                }
            );

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Checkout failed.");
            }

            checkoutMessage = "Checkout successful!";
            cart = [];
            paymentMethod = "";
            shippingAddress = "";
        } catch (e) {
            checkoutMessage = (e as Error).message;
        }
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
    <div>
        <h3>Checkout</h3>
        <label>
            Payment Method:
            <input
                type="text"
                bind:value={paymentMethod}
                placeholder="e.g., Credit Card"
            />
        </label>
        <label>
            Shipping Address:
            <textarea
                bind:value={shippingAddress}
                placeholder="Enter shipping address here"
            ></textarea>
        </label>
        <button on:click={checkout}>Confirm Checkout</button>
        {#if checkoutMessage}
            <p
                class={checkoutMessage.includes("success")
                    ? "success"
                    : "error"}
            >
                {checkoutMessage}
            </p>
        {/if}
    </div>
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
