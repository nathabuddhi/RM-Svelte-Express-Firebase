<script lang="ts">
    import { onMount } from "svelte";
    import {
        getAllAvailableProducts,
        searchProducts,
    } from "../services/searchService";
    import type { Product } from "../types/product";
    import { navigate } from "svelte-routing";

    let products: Product[] = [];
    let loading = true;
    let error: string | null = null;
    let searchTerm: string = "";

    onMount(async () => {
        await loadProducts();
    });

    const loadProducts = async () => {
        try {
            loading = true;
            error = null;
            products = await getAllAvailableProducts();
        } catch (err) {
            error =
                err instanceof Error ? err.message : "Failed to load products";
        } finally {
            loading = false;
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            await loadProducts();
            return;
        }

        try {
            loading = true;
            error = null;
            products = await searchProducts(searchTerm);

            if (products.length === 0) {
                error = `No products found for "${searchTerm}"`;
            }
        } catch (err) {
            error = err instanceof Error ? err.message : "Search failed";
        } finally {
            loading = false;
        }
    };

    const navigateToProduct = (productId: string) => {
        navigate(`/product/${productId}`);
    };

    const truncateDescription = (
        desc: string,
        maxLength: number = 100
    ): string => {
        return desc.length > maxLength
            ? `${desc.substring(0, maxLength)}...`
            : desc;
    };
</script>

<svelte:head>
    <title>Product Search</title>
</svelte:head>

<div class="search-container">
    <h1>Product Search</h1>

    <div class="search-bar">
        <input
            type="text"
            bind:value={searchTerm}
            placeholder="Search products..."
            on:keyup={(e) => e.key === "Enter" && handleSearch()}
        />
        <button on:click={handleSearch}>Search</button>
    </div>

    {#if error}
        <div class="error-message">{error}</div>
    {/if}

    {#if loading}
        <div class="loading">Loading products...</div>
    {:else}
        <div class="product-grid">
            {#each products as product (product.productId)}
                <div
                    class="product-card"
                    on:click={() => navigateToProduct(product.productId)}
                >
                    {#if product.productImages.length > 0}
                        <img
                            src={product.productImages[0]}
                            alt={product.productName}
                            class="product-image"
                        />
                    {:else}
                        <div class="no-image">No Image Available</div>
                    {/if}
                    <div class="product-details">
                        <h3>{product.productName}</h3>
                        <p class="description">
                            {truncateDescription(product.productDescription)}
                        </p>
                        <div class="price-stock">
                            <span class="price"
                                >${product.productPrice.toFixed(2)}</span
                            >
                            <span class="stock"
                                >{product.productStock} in stock</span
                            >
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style lang="scss">
    .search-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;

        h1 {
            text-align: center;
            margin-bottom: 2rem;
            color: #333;
        }

        .search-bar {
            display: flex;
            margin-bottom: 2rem;
            gap: 1rem;

            input {
                flex: 1;
                padding: 0.75rem 1rem;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 1rem;

                &:focus {
                    outline: none;
                    border-color: #3498db;
                }
            }

            button {
                padding: 0.75rem 1.5rem;
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
            }
        }

        .error-message {
            color: #e74c3c;
            background: #fdecea;
            padding: 1rem;
            border-radius: 4px;
            margin-bottom: 2rem;
            text-align: center;
        }

        .loading {
            text-align: center;
            padding: 2rem;
            color: #666;
        }

        .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 2rem;
        }

        .product-card {
            border: 1px solid #eee;
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
            transition:
                transform 0.2s,
                box-shadow 0.2s;

            &:hover {
                transform: translateY(-5px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }

            .product-image {
                width: 100%;
                height: 200px;
                object-fit: cover;
            }

            .no-image {
                width: 100%;
                height: 200px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f5f5f5;
                color: #999;
            }

            .product-details {
                padding: 1.5rem;

                h3 {
                    margin: 0 0 0.5rem 0;
                    color: #333;
                }

                .description {
                    color: #666;
                    margin: 0 0 1rem 0;
                    font-size: 0.9rem;
                }

                .price-stock {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;

                    .price {
                        font-weight: bold;
                        color: #2ecc71;
                        font-size: 1.1rem;
                    }

                    .stock {
                        color: #7f8c8d;
                        font-size: 0.9rem;
                    }
                }
            }
        }
    }
</style>
