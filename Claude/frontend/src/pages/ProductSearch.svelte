<script lang="ts">
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";

    // Product interface
    interface Product {
        id: string;
        productId: string;
        productName: string;
        productDescription: string;
        productImages: string[];
        productPrice: string;
        productStock: number;
        sellerId: string;
    }

    // State management
    let products: Product[] = [];
    let filteredProducts: Product[] = [];
    let searchQuery: string = "";
    let loading: boolean = true;
    let error: string = "";
    let searching: boolean = false;

    // API base URL
    const API_URL = "http://localhost:5000/api";

    // Fetch products on component mount
    onMount(async () => {
        await fetchProducts();
    });

    // Fetch available products (stock > 0)
    async function fetchProducts() {
        loading = true;
        error = "";

        try {
            const response = await fetch(`${API_URL}/search`);

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to fetch products");
            }

            products = await response.json();
            filteredProducts = [...products];
        } catch (err) {
            error = err.message || "An error occurred while fetching products";
            console.error("Fetch error:", err);
        } finally {
            loading = false;
        }
    }

    // Navigate to product detail page
    function viewProductDetails(productId: string) {
        navigate(`/product/${productId}`);
    }

    // Search products from API
    async function searchProducts() {
        searching = true;
        error = "";

        try {
            const response = await fetch(
                `${API_URL}/search?q=${encodeURIComponent(searchQuery)}`
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to search products");
            }

            filteredProducts = await response.json();

            if (filteredProducts.length === 0 && searchQuery.trim() !== "") {
                error = `No products found matching "${searchQuery}"`;
            }
        } catch (err) {
            error = err.message || "An error occurred while searching products";
            console.error("Search error:", err);
        } finally {
            searching = false;
        }
    }

    // Handle search input change
    function handleSearchInput() {
        // Clear error when search query changes
        error = "";
    }

    // Handle search form submission
    function handleSearchSubmit() {
        searchProducts();
    }

    // Format price as currency
    function formatPrice(price: string): string {
        return parseFloat(price).toFixed(2);
    }

    // Truncate description for product cards
    function truncateDescription(
        description: string,
        maxLength: number = 100
    ): string {
        if (description.length <= maxLength) return description;
        return description.slice(0, maxLength) + "...";
    }
</script>

<div class="product-search">
    <h1>Products</h1>

    <!-- Search Form -->
    <div class="search-container">
        <form on:submit|preventDefault={handleSearchSubmit}>
            <input
                type="text"
                placeholder="Search products..."
                bind:value={searchQuery}
                on:input={handleSearchInput}
            />
            <button type="submit" disabled={searching}>
                {searching ? "Searching..." : "Search"}
            </button>
        </form>
    </div>

    <!-- Error Message -->
    {#if error}
        <div class="error-message">{error}</div>
    {/if}

    <!-- Product List -->
    <div class="product-list">
        {#if loading}
            <div class="loading">Loading products...</div>
        {:else if filteredProducts.length === 0}
            <div class="no-products">
                {searchQuery
                    ? `No products found matching "${searchQuery}"`
                    : "No products available"}
            </div>
        {:else}
            <div class="products-grid">
                {#each filteredProducts as product}
                    <div
                        class="product-card"
                        on:click={() => viewProductDetails(product.id)}
                        on:keydown={(e) =>
                            e.key === "Enter" && viewProductDetails(product.id)}
                        tabindex="0"
                    >
                        <div class="product-image">
                            {#if product.productImages && product.productImages.length > 0}
                                <img
                                    src={product.productImages[0]}
                                    alt={product.productName}
                                />
                            {:else}
                                <div class="no-image">No Image</div>
                            {/if}
                        </div>

                        <div class="product-info">
                            <h3 class="product-name">{product.productName}</h3>
                            <p class="product-description">
                                {truncateDescription(
                                    product.productDescription
                                )}
                            </p>
                            <div class="product-details">
                                <span class="product-price"
                                    >${formatPrice(product.productPrice)}</span
                                >
                                <span class="product-stock"
                                    >In stock: {product.productStock}</span
                                >
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style lang="scss">
    .product-search {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem 1rem;

        h1 {
            text-align: center;
            margin-bottom: 2rem;
        }
    }

    .search-container {
        margin-bottom: 2rem;

        form {
            display: flex;
            max-width: 600px;
            margin: 0 auto;

            input {
                flex: 1;
                padding: 0.75rem;
                border: 1px solid #ddd;
                border-radius: 0.25rem 0 0 0.25rem;
                font-size: 1rem;
            }

            button {
                padding: 0.75rem 1.5rem;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 0 0.25rem 0.25rem 0;
                cursor: pointer;
                font-weight: 500;

                &:disabled {
                    background-color: #6c757d;
                    cursor: not-allowed;
                }
            }
        }
    }

    .error-message {
        background-color: #f8d7da;
        color: #721c24;
        padding: 0.75rem;
        margin-bottom: 1.5rem;
        border-radius: 0.25rem;
        text-align: center;
    }

    .loading,
    .no-products {
        text-align: center;
        padding: 3rem 0;
        color: #6c757d;
        font-size: 1.25rem;
    }

    .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
    }

    .product-card {
        border: 1px solid #eee;
        border-radius: 0.5rem;
        overflow: hidden;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        transition:
            transform 0.2s,
            box-shadow 0.2s;
        cursor: pointer;

        &:hover,
        &:focus {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .product-image {
            height: 200px;
            background-color: #f8f9fa;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .no-image {
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #6c757d;
            }
        }

        .product-info {
            padding: 1rem;

            .product-name {
                margin: 0 0 0.5rem;
                font-size: 1.25rem;
            }

            .product-description {
                margin-bottom: 1rem;
                color: #6c757d;
                font-size: 0.9rem;
                line-height: 1.4;
            }

            .product-details {
                display: flex;
                justify-content: space-between;
                align-items: center;

                .product-price {
                    font-weight: bold;
                    color: #007bff;
                    font-size: 1.1rem;
                }

                .product-stock {
                    font-size: 0.85rem;
                    color: #28a745;
                }
            }
        }
    }
</style>
