<script lang="ts">
    import { onMount } from "svelte";
    import { auth } from "../lib/firebase";

    let role: "customer" | "seller" = "customer";
    let email = "";
    let orders: any[] = [];
    let message = "";

    let tabs = ["Pending", "Accepted", "Shipped", "Completed"];
    let activeTab = "Pending";

    async function loadOrders() {
        email = localStorage.getItem("userEmail") || "";
        const endpoint =
            role === "seller"
                ? `http://localhost:5000/api/orders/seller/${email}`
                : `http://localhost:5000/api/orders/customer/${email}`;

        const res = await fetch(endpoint);
        orders = await res.json();
    }

    async function updateStatus(orderId: string, status: string) {
        const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        const data = await res.json();
        message = data.message || data.error;
        await loadOrders();
    }

    async function loadRole(email: string) {
        const res = await fetch(
            `http://localhost:5000/api/check-role/${email}`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }
        );
        const data = await res.json();
        return data.role;
    }

    onMount(() => {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                role = await loadRole(user.email || "");
                loadOrders();
            }
        });
    });
</script>

<h2>{role === "seller" ? "Seller Orders" : "My Orders"}</h2>
{#if message}
    <p class={message.includes("fail") ? "error" : "success"}>{message}</p>
{/if}

{#if role === "seller"}
    <div class="tabs">
        {#each tabs as tab}
            <button
                class:active={activeTab === tab}
                on:click={() => (activeTab = tab)}>{tab}</button
            >
        {/each}
    </div>
    {#each orders.filter((o) => o.status === activeTab) as order}
        <div class="order">
            <p><strong>Product ID:</strong> {order.productId}</p>
            <p><strong>Qty:</strong> {order.quantity}</p>
            <p><strong>Customer:</strong> {order.customer}</p>
            <p><strong>Status:</strong> {order.status}</p>
            {#if order.status === "Pending"}
                <button on:click={() => updateStatus(order.orderId, "Accepted")}
                    >Accept</button
                >
            {/if}
            {#if order.status === "Accepted"}
                <button on:click={() => updateStatus(order.orderId, "Shipped")}
                    >Ship</button
                >
            {/if}
        </div>
    {/each}
{:else}
    {#each orders as order}
        <div class="order">
            <p><strong>Product ID:</strong> {order.productId}</p>
            <p><strong>Qty:</strong> {order.quantity}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p>
                <strong>Placed:</strong>
                {order.timestamp}
            </p>
            {#if order.status === "Shipped"}
                <button
                    on:click={() => updateStatus(order.orderId, "Completed")}
                    >Mark as Received</button
                >
            {/if}
        </div>
    {/each}
{/if}

<style lang="scss">
    .tabs {
        margin: 1rem 0;
        display: flex;
        gap: 1rem;
    }
    .tabs button.active {
        background: #007bff;
        color: white;
    }
    .order {
        border: 1px solid #ddd;
        padding: 1rem;
        margin-bottom: 1rem;
    }
    .success {
        color: green;
    }
    .error {
        color: red;
    }
</style>
