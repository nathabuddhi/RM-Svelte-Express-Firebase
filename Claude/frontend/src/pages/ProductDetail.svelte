<script lang="ts">
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";
    import { onAuthStateChanged } from "firebase/auth";
    import { auth } from "../lib/firebase"; // adjust path as needed

    export let id: string;

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

    let product: Product | null = null;
    let loading = true;
    let error = "";
    let quantity = 1;
    let currentImageIndex = 0;

    let isAuthenticated = false;
    let idToken = "";

    const API_URL = "http://localhost:5000/api/search";
    const CART_URL = "http://localhost:5000/api/cart";

    onMount(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                isAuthenticated = true;
                idToken = await user.getIdToken();
            } else {
                isAuthenticated = false;
            }
        });

        fetchProductDetails();
    });

    async function fetchProductDetails() {
        loading = true;
        error = "";

        try {
            const response = await fetch(`${API_URL}/${id}`);
            if (!response.ok) {
                const data = await response.json();
                throw new Error(
                    data.message || "Failed to fetch product details"
                );
            }

            product = await response.json();
            currentImageIndex = product?.productImages?.length > 0 ? 0 : -1;
        } catch (err) {
            error = err instanceof Error ? err.message : "Fetch error";
            console.error("Fetch error:", err);
        } finally {
            loading = false;
        }
    }

    function formatPrice(price: string): string {
        return parseFloat(price).toFixed(2);
    }

    function handleQuantityChange(value: number) {
        if (!product) return;

        const newQuantity = quantity + value;
        if (newQuantity >= 1 && newQuantity <= product.productStock) {
            quantity = newQuantity;
        }
    }

    async function handleAddToCart() {
        if (!product) return;

        if (!isAuthenticated) {
            navigate("/login", { state: { redirectTo: `/product/${id}` } });
            return;
        }

        try {
            const res = await fetch(CART_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    productId: product.productId || product.id,
                    quantity,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to add to cart");
            }

            alert(`Added ${quantity} x ${product.productName} to cart`);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Unexpected error");
        }
    }

    function changeImage(index: number) {
        if (!product || !product.productImages) return;
        if (index >= 0 && index < product.productImages.length) {
            currentImageIndex = index;
        }
    }
</script>

<div class="product-detail">
    {#if loading}
        <div class="loading">Loading product details...</div>
    {:else if error}
        <div class="error-message">{error}</div>
    {:else if product}
        <div class="product-container">
            <!-- Product Images -->
            <div class="product-images">
                <div class="main-image">
                    {#if product.productImages && product.productImages.length > 0}
                        <img
                            src={product.productImages[currentImageIndex]}
                            alt={product.productName}
                        />
                    {:else}
                        <div class="no-image">No Image Available</div>
                    {/if}
                </div>

                {#if product.productImages && product.productImages.length > 1}
                    <div class="thumbnail-container">
                        {#each product.productImages as image, index}
                            <div
                                class="thumbnail {index === currentImageIndex
                                    ? 'active'
                                    : ''}"
                                on:click={() => changeImage(index)}
                                on:keydown={(e) =>
                                    e.key === "Enter" && changeImage(index)}
                                tabindex="0"
                            >
                                <img
                                    src={image}
                                    alt={`${product.productName} thumbnail ${index + 1}`}
                                />
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>

            <!-- Product Info -->
            <div class="product-info">
                <h1>{product.productName}</h1>

                <div class="product-price">
                    <span class="price"
                        >${formatPrice(product.productPrice)}</span
                    >
                    <span class="stock">In Stock: {product.productStock}</span>
                </div>

                <div class="product-description">
                    <h3>Description</h3>
                    <p>{product.productDescription}</p>
                </div>

                <!-- Quantity Selector -->
                <div class="quantity-container">
                    <span>Quantity:</span>
                    <div class="quantity-selector">
                        <button
                            on:click={() => handleQuantityChange(-1)}
                            disabled={quantity <= 1}>-</button
                        >
                        <span>{quantity}</span>
                        <button
                            on:click={() => handleQuantityChange(1)}
                            disabled={quantity >= product.productStock}
                            >+</button
                        >
                    </div>
                </div>

                <!-- Add to Cart Button -->
                <button
                    class="add-to-cart"
                    on:click={handleAddToCart}
                    disabled={product.productStock <= 0}
                >
                    {!isAuthenticated ? "Login to Add to Cart" : "Add to Cart"}
                </button>

                {#if product.productStock <= 0}
                    <div class="out-of-stock">
                        This product is currently out of stock
                    </div>
                {/if}
            </div>
        </div>
    {:else}
        <div class="error-message">Product not found</div>
    {/if}
</div>

<style lang="scss">
    .product-detail {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem 1rem;
    }

    .loading {
        text-align: center;
        padding: 3rem 0;
        font-size: 1.25rem;
        color: #6c757d;
    }

    .error-message {
        background-color: #f8d7da;
        color: #721c24;
        padding: 1rem;
        border-radius: 0.25rem;
        margin: 2rem 0;
        text-align: center;
    }

    .product-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;

        @media (max-width: 768px) {
            grid-template-columns: 1fr;
        }
    }

    .product-images {
        .main-image {
            width: 100%;
            height: 400px;
            border: 1px solid #eee;
            border-radius: 0.5rem;
            overflow: hidden;
            margin-bottom: 1rem;

            img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }

            .no-image {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #f8f9fa;
                color: #6c757d;
            }
        }

        .thumbnail-container {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;

            .thumbnail {
                width: 70px;
                height: 70px;
                border: 1px solid #ddd;
                border-radius: 0.25rem;
                overflow: hidden;
                cursor: pointer;

                &.active {
                    border: 2px solid #007bff;
                }

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }
        }
    }

    .product-info {
        h1 {
            margin: 0 0 1rem;
            font-size: 2rem;
        }

        .product-price {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;

            .price {
                font-size: 1.5rem;
                font-weight: bold;
                color: #007bff;
            }

            .stock {
                font-size: 0.9rem;
                color: #28a745;
            }
        }

        .product-description {
            margin-bottom: 2rem;

            h3 {
                font-size: 1.25rem;
                margin-bottom: 0.5rem;
            }

            p {
                line-height: 1.6;
                color: #333;
            }
        }

        .quantity-container {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.5rem;

            .quantity-selector {
                display: flex;
                align-items: center;

                button {
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #f1f1f1;
                    border: 1px solid #ddd;
                    cursor: pointer;
                    font-size: 1.25rem;
                    font-weight: bold;

                    &:first-child {
                        border-radius: 0.25rem 0 0 0.25rem;
                    }

                    &:last-child {
                        border-radius: 0 0.25rem 0.25rem 0;
                    }

                    &:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                }

                span {
                    width: 40px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-top: 1px solid #ddd;
                    border-bottom: 1px solid #ddd;
                    background-color: white;
                }
            }
        }

        .add-to-cart {
            width: 100%;
            padding: 0.75rem;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 0.25rem;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;

            &:hover:not(:disabled) {
                background-color: #0069d9;
            }

            &:disabled {
                background-color: #6c757d;
                cursor: not-allowed;
            }
        }

        .out-of-stock {
            margin-top: 1rem;
            color: #dc3545;
            text-align: center;
            font-weight: 500;
        }
    }
</style>
