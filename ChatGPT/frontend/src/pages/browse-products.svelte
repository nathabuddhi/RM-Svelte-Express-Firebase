<script lang="ts">
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";

    let products: any[] = [];
    let searchTerm = "";
    let error = "";

    async function searchProducts() {
        error = "";
        console.log("Searching for products with term:", searchTerm);
        try {
            const res = await fetch(
                `http://localhost:5000/api/products/search/${searchTerm}}`
            );
            const data = await res.json();
            console.log("Search results:", data);
            if (!res.ok) throw new Error(data.error);
            products = data;
        } catch (e) {
            products = [];
            error = (e as Error).message;
        }
    }

    function viewProduct(productId: string, sellerEmail: string) {
        navigate(`/product/${sellerEmail}/${productId}`);
    }

    onMount(() => {
        searchProducts(); // initial load
    });
</script>

<h2>Browse Products</h2>

<input type="text" bind:value={searchTerm} placeholder="Search product..." />
<button on:click={searchProducts}>Search</button>

{#if error}
    <p class="error">{error}</p>
{:else}
    <div class="products">
        {#each products as p}
            <div
                class="product"
                on:click={() => viewProduct(p.productId, p.owner || "unknown")}
            >
                {#if p.productImages?.[0]}
                    <img src={p.productImages[0]} alt={p.productName} />
                {/if}
                <h3>{p.productName}</h3>
                <p>
                    {p.productDescription.length > 80
                        ? p.productDescription.slice(0, 80) + "..."
                        : p.productDescription}
                </p>
                <p>Price: ${p.productPrice}</p>
                <p>Stock: {p.productStock}</p>
            </div>
        {/each}
    </div>
{/if}

<style lang="scss">
    .products {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    }

    .product {
        border: 1px solid #ccc;
        padding: 1rem;
        cursor: pointer;
        transition: box-shadow 0.2s ease;
        background: white;

        &:hover {
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        img {
            width: 100%;
            height: 150px;
            object-fit: cover;
        }

        h3 {
            margin: 0.5rem 0;
        }

        p {
            font-size: 0.9rem;
        }
    }

    .error {
        color: red;
    }
</style>
