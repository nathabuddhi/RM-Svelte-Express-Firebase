<script lang="ts">
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";

    let product: any = {};
    let loading = true;
    let productId = "";
    let email = "";
    let errorMessage = "";

    // Fetch product details
    async function loadProductDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const pathSegments = window.location.pathname.split("/");
        email = pathSegments[pathSegments.length - 2] || "";
        productId = pathSegments[pathSegments.length - 1] || "";

        try {
            const res = await fetch(
                `http://localhost:5000/api/products/detail/${email}/${productId}`
            );
            if (!res.ok) {
                throw new Error("Product not found.");
            }

            product = await res.json();
            loading = false;
        } catch (e) {
            errorMessage = "Failed to load product details.";
            loading = false;
        }
    }

    // Call loadProductDetails when page loads
    onMount(() => {
        loadProductDetails();
    });

    // Placeholder Add to Cart functionality
    function addToCart() {
        alert("Add to Cart functionality is coming soon!");
    }
</script>

{#if loading}
    <p>Loading product details...</p>
{:else if errorMessage}
    <p class="error-message">{errorMessage}</p>
{:else}
    <div class="product-detail">
        <img src={product.productImages?.[0]} alt={product.productName} />
        <h2>{product.productName}</h2>
        <p>{product.productDescription}</p>
        <div class="price">Price: ${product.productPrice}</div>
        <div class="stock">Stock: {product.productStock}</div>
        <button on:click={addToCart}>Add to Cart</button>
    </div>
{/if}

<style lang="scss">
    .product-detail {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .product-detail img {
        width: 100%;
        height: auto;
        border-radius: 8px;
    }

    .product-detail h2 {
        margin: 1rem 0;
        font-size: 2rem;
        color: #333;
    }

    .product-detail p {
        font-size: 1rem;
        color: #555;
    }

    .product-detail .price {
        font-size: 1.2rem;
        color: #007bff;
        margin-top: 1rem;
    }

    .product-detail .stock {
        margin-top: 1rem;
        font-size: 1rem;
    }

    .product-detail button {
        background-color: #28a745;
        color: white;
        padding: 0.5rem 1.5rem;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 1.5rem;
        font-size: 1rem;
    }

    .product-detail button:hover {
        background-color: #218838;
    }

    .error-message {
        color: red;
        font-size: 1.2rem;
    }
</style>
