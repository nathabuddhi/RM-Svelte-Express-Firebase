<script lang="ts">
    import { auth } from "../lib/firebase";
    import { onMount } from "svelte";

    let loading = true;

    let products: any[] = [];
    let form = {
        productId: "",
        productName: "",
        productDescription: "",
        productPrice: 0,
        productStock: 0,
        productImages: [] as string[],
    };

    let email = "";
    let isEdit = false;
    let message = "";

    function resetForm() {
        isEdit = false;
        form = {
            productId: "",
            productName: "",
            productDescription: "",
            productPrice: 0,
            productStock: 0,
            productImages: [],
        };
    }

    function handleImageUpload(e: Event) {
        const file = (e.target as HTMLInputElement)?.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                form.productImages = [reader.result as string];
            };
            reader.readAsDataURL(file);
        }
    }

    async function loadProducts() {
        const res = await fetch(`http://localhost:5000/api/products/${email}`);
        const data = await res.json();
        products = data;
        loading = false;
    }

    async function saveProduct() {
        const endpoint = isEdit
            ? `http://localhost:5000/api/products/${email}/${form.productId}`
            : `http://localhost:5000/api/products/${email}`;

        const method = isEdit ? "PUT" : "POST";

        const res = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        const result = await res.json();
        message = result.message || result.error;
        resetForm();
        loadProducts();
    }

    function editProduct(p: any) {
        form = { ...p };
        isEdit = true;
    }

    async function deleteProduct(productId: string) {
        if (!confirm("Delete this product?")) return;
        const res = await fetch(
            `http://localhost:5000/api/products/${email}/${productId}`,
            {
                method: "DELETE",
            }
        );
        const result = await res.json();
        message = result.message || result.error;
        loadProducts();
    }

    onMount(() => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                email = user.email!;
                loadProducts();
            }
        });
    });
</script>

<!-- Same SCSS & UI structure as previous version -->

<h2>Seller Product Management</h2>

{#if message}<p class="message">{message}</p>{/if}

<form on:submit|preventDefault={saveProduct}>
    <input
        type="text"
        bind:value={form.productName}
        placeholder="Product Name"
        required
    />
    <textarea bind:value={form.productDescription} placeholder="Description"
    ></textarea>
    <input
        type="number"
        bind:value={form.productPrice}
        placeholder="Price ($)"
        required
    />
    <input
        type="number"
        bind:value={form.productStock}
        placeholder="Stock"
        required
    />
    <input type="file" accept="image/*" on:change={handleImageUpload} />
    <button type="submit">{isEdit ? "Update" : "Add"} Product</button>
    {#if isEdit}<button type="button" on:click={resetForm}>Cancel</button>{/if}
</form>

{#if loading}
    <p>Loading existing products...</p>
{:else}
    {#each products as p}
        <div class="product">
            <h3>{p.productName}</h3>
            <p>{p.productDescription}</p>
            <p>Price: ${p.productPrice}</p>
            <p>Stock: {p.productStock}</p>
            {#if p.productImages?.[0]}<img
                    src={p.productImages[0]}
                    alt="Image"
                    width="100"
                />{/if}
            <button on:click={() => editProduct(p)}>Edit</button>
            <button on:click={() => deleteProduct(p.productId)}>Delete</button>
        </div>
    {/each}
{/if}

<style lang="scss">
    form {
        margin-bottom: 2rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-width: 400px;
    }
    .product {
        border: 1px solid #ccc;
        margin-bottom: 1rem;
        padding: 1rem;
    }
    .message {
        color: green;
    }
</style>
