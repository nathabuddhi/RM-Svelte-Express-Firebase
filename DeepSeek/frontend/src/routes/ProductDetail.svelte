<script lang="ts">
    import { onMount } from "svelte";
    import type { Product } from "../types/product";
    import { addOrUpdateCartItem } from "../services/cartService";
    import { navigate } from "svelte-routing";

    let id: string; // Product ID from route param

    let product: Product | null = null;
    let loading = true;
    let error: string | null = null;
    let quantity = 1;

    onMount(async () => {
        try {
            id = window.location.pathname.split("/").pop() || "";
            const response = await fetch(`/api/products/${id}`);
            if (!response.ok) {
                throw new Error("Product not found");
            }
            product = await response.json();
        } catch (err) {
            error =
                err instanceof Error ? err.message : "Failed to load product";
        } finally {
            loading = false;
        }
    });

    const addToCart = async () => {
        if (!product || quantity < 1) return;

        try {
            await addOrUpdateCartItem(product.productId, quantity);
            navigate("/cart");
        } catch (err) {
            alert(err);
        }
    };
</script>

<svelte:head>
    <title>{product?.productName || "Product"}</title>
</svelte:head>

{#if loading}
    <div class="loading">Loading product...</div>
{:else if error}
    <div class="error-message">{error}</div>
{:else if product}
    <div class="product-page">
        <div class="product-images">
            {#each product.productImages as image, index (index)}
                <img
                    src={image}
                    alt={`${product.productName} - Image ${index + 1}`}
                />
            {/each}
        </div>

        <div class="product-details">
            <h1>{product.productName}</h1>
            <p class="price">${product.productPrice.toFixed(2)}</p>
            <p class="stock">{product.productStock} available</p>
            <p class="description">{product.productDescription}</p>

            <div class="add-to-cart">
                <label for="quantity">Quantity:</label>
                <input
                    type="number"
                    id="quantity"
                    bind:value={quantity}
                    min="1"
                    max={product.productStock}
                />
                <button on:click={addToCart}>Add to Cart</button>
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
    .loading,
    .error-message {
        text-align: center;
        padding: 2rem;
    }

    .error-message {
        color: #e74c3c;
    }

    .product-page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3rem;

        .product-images {
            img {
                width: 100%;
                max-height: 500px;
                object-fit: contain;
                margin-bottom: 1rem;
                border: 1px solid #eee;
                border-radius: 4px;
            }
        }

        .product-details {
            h1 {
                margin-top: 0;
                color: #333;
            }

            .price {
                font-size: 1.5rem;
                font-weight: bold;
                color: #2ecc71;
                margin: 1rem 0;
            }

            .stock {
                color: #7f8c8d;
                margin-bottom: 1.5rem;
            }

            .description {
                line-height: 1.6;
                color: #555;
            }

            .add-to-cart {
                margin-top: 2rem;
                display: flex;
                align-items: center;
                gap: 1rem;

                label {
                    font-weight: 500;
                }

                input {
                    width: 60px;
                    padding: 0.5rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }

                button {
                    padding: 0.75rem 1.5rem;
                    background: #3498db;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background 0.2s;

                    &:hover {
                        background: #2980b9;
                    }
                }
            }
        }
    }
</style>
