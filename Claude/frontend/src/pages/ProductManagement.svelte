<script lang="ts">
    import { onMount } from "svelte";

    import { onAuthStateChanged } from "firebase/auth";
    import { auth } from "../lib/firebase"; // adjust if path differs
    import { navigate } from "svelte-routing"; // or $app/navigation if you're using SvelteKit

    // Product interface
    interface Product {
        id: string;
        productName: string;
        productDescription: string;
        productImages: string[];
        productPrice: string;
        productStock: number;
        sellerId: string;
    }

    // Firebase Auth token and UID
    let token: string = "";
    let uid: string = "";

    // Form data
    let productName = "";
    let productDescription = "";
    let productImages: string[] = [];
    let productPrice = "";
    let productStock = "";
    let imageUrl = "";

    // State
    let products: Product[] = [];
    let loading = true;
    let error = "";
    let success = "";
    let editMode = false;
    let currentProductId = "";

    const API_URL = "http://localhost:5000/api/products";

    onMount(() => {
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigate("/login");
                return;
            }

            uid = user.uid;
            token = await user.getIdToken();
            await fetchProducts();
        });
    });
    // Fetch products from API
    async function fetchProducts() {
        loading = true;
        error = "";

        try {
            const response = await fetch(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to fetch products");
            }

            products = await response.json();
        } catch (err) {
            error = err instanceof Error ? err.message : "An error occurred while fetching products";
            console.error("Fetch error:", err);
        } finally {
            loading = false;
        }
    }

    // Handle form submission (create or update)
    async function handleSubmit() {
        error = "";
        success = "";

        // Validate form
        if (!productName || !productDescription || !productPrice) {
            error = "Please fill in all required fields";
            return;
        }

        const productData = {
            productName,
            productDescription,
            productImages,
            productPrice,
            productStock: parseInt(productStock) || 0,
        };

        try {
            let response;

            if (editMode) {
                // Update existing product
                response = await fetch(`${API_URL}/${currentProductId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(productData),
                });
            } else {
                // Create new product
                response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(productData),
                });
            }

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to save product");
            }

            // Reset form and refresh products
            resetForm();
            success = editMode
                ? "Product updated successfully"
                : "Product created successfully";
            await fetchProducts();
        } catch (err) {
            error = err instanceof Error ? err.message : "An error occurred";
            console.error("Submit error:", err);
        }
    }

    // Delete a product
    async function deleteProduct(id: string) {
        if (!confirm("Are you sure you want to delete this product?")) {
            return;
        }

        error = "";
        success = "";

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to delete product");
            }

            success = "Product deleted successfully";
            await fetchProducts();
        } catch (err) {
            error = err instanceof Error ? err.message : "An error occurred";
            console.error("Delete error:", err);
        }
    }

    // Edit a product
    function editProduct(product: Product) {
        editMode = true;
        currentProductId = product.id;
        productName = product.productName;
        productDescription = product.productDescription;
        productImages = [...product.productImages];
        productPrice = product.productPrice;
        productStock = product.productStock.toString();

        // Scroll to form
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Reset form
    function resetForm() {
        editMode = false;
        currentProductId = "";
        productName = "";
        productDescription = "";
        productImages = [];
        productPrice = "";
        productStock = "";
        imageUrl = "";
    }

    // Add image URL to images array
    function addImage() {
        if (imageUrl && imageUrl.trim() !== "") {
            productImages = [...productImages, imageUrl.trim()];
            imageUrl = "";
        }
    }

    // Remove image from images array
    function removeImage(index: number) {
        productImages = productImages.filter((_, i) => i !== index);
    }

    // Format price as currency
    function formatPrice(price: string): string {
        return parseFloat(price).toFixed(2);
    }
</script>

<div class="product-management">
    <h1>{editMode ? "Edit Product" : "Add New Product"}</h1>

    <!-- Success and Error messages -->
    {#if success}
        <div class="success-message">{success}</div>
    {/if}

    {#if error}
        <div class="error-message">{error}</div>
    {/if}

    <!-- Product Form -->
    <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
            <label for="productName">Product Name*</label>
            <input
                type="text"
                id="productName"
                bind:value={productName}
                required
            />
        </div>

        <div class="form-group">
            <label for="productDescription">Product Description*</label>
            <textarea
                id="productDescription"
                bind:value={productDescription}
                rows="4"
                required
            ></textarea>
        </div>

        <div class="form-group">
            <label for="productPrice">Price* ($)</label>
            <input
                type="number"
                id="productPrice"
                bind:value={productPrice}
                min="0"
                step="0.01"
                required
            />
        </div>

        <div class="form-group">
            <label for="productStock">Stock Quantity</label>
            <input
                type="number"
                id="productStock"
                bind:value={productStock}
                min="0"
                step="1"
            />
        </div>

        <div class="form-group">
            <label>Product Images</label>
            <div class="image-input">
                <input
                    type="url"
                    bind:value={imageUrl}
                    placeholder="Enter image URL"
                />
                <button type="button" on:click={addImage}>Add Image</button>
            </div>

            {#if productImages.length > 0}
                <div class="image-list">
                    {#each productImages as image, index}
                        <div class="image-item">
                            <img src={image} alt="Product" />
                            <button
                                type="button"
                                on:click={() => removeImage(index)}
                                >Remove</button
                            >
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="form-actions">
            <button type="submit"
                >{editMode ? "Update Product" : "Create Product"}</button
            >
            {#if editMode}
                <button type="button" on:click={resetForm}>Cancel</button>
            {/if}
        </div>
    </form>

    <!-- Product List -->
    <div class="product-list">
        <h2>Your Products</h2>

        {#if loading}
            <p>Loading products...</p>
        {:else if products.length === 0}
            <p>You don't have any products yet.</p>
        {:else}
            <div class="products">
                {#each products as product}
                    <div class="product-card">
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
                            <h3>{product.productName}</h3>
                            <p class="product-price">
                                ${formatPrice(product.productPrice)}
                            </p>
                            <p class="product-stock">
                                Stock: {product.productStock}
                            </p>

                            <div class="product-actions">
                                <button on:click={() => editProduct(product)}
                                    >Edit</button
                                >
                                <button
                                    on:click={() => deleteProduct(product.id)}
                                    >Delete</button
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
    .product-management {
        padding: 1rem;
        max-width: 1200px;
        margin: 0 auto;

        h1,
        h2 {
            margin-bottom: 1rem;
        }
    }

    .success-message {
        background-color: #d4edda;
        color: #155724;
        padding: 0.75rem;
        margin-bottom: 1rem;
        border-radius: 0.25rem;
    }

    .error-message {
        background-color: #f8d7da;
        color: #721c24;
        padding: 0.75rem;
        margin-bottom: 1rem;
        border-radius: 0.25rem;
    }

    form {
        background-color: black;
        padding: 1.5rem;
        border-radius: 0.5rem;
        margin-bottom: 2rem;

        .form-group {
            margin-bottom: 1rem;

            label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
            }

            input,
            textarea {
                width: 100%;
                padding: 0.5rem;
                border: 1px solid #ddd;
                border-radius: 0.25rem;
                font-size: 1rem;
            }
        }

        .image-input {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;

            input {
                flex-grow: 1;
            }
        }

        .image-list {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;

            .image-item {
                position: relative;
                width: 100px;
                height: 100px;
                border: 1px solid #ddd;
                border-radius: 0.25rem;
                overflow: hidden;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                button {
                    position: absolute;
                    top: 0;
                    right: 0;
                    background-color: rgba(255, 0, 0, 0.7);
                    color: white;
                    border: none;
                    font-size: 0.75rem;
                    padding: 0.2rem 0.4rem;
                    cursor: pointer;
                }
            }
        }

        .form-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;

            button {
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 0.25rem;
                cursor: pointer;
                font-weight: 500;

                &:first-child {
                    background-color: #007bff;
                    color: white;
                }

                &:last-child {
                    background-color: #6c757d;
                    color: white;
                }
            }
        }
    }

    .product-list {
        margin-top: 2rem;

        .products {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
        }

        .product-card {
            border: 1px solid #ddd;
            border-radius: 0.5rem;
            overflow: hidden;

            .product-image {
                height: 200px;
                overflow: hidden;

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
                    background-color: #f1f1f1;
                    color: #666;
                }
            }

            .product-info {
                padding: 1rem;

                h3 {
                    margin: 0 0 0.5rem;
                }

                .product-price {
                    font-weight: bold;
                    color: #007bff;
                    margin-bottom: 0.5rem;
                }

                .product-stock {
                    font-size: 0.9rem;
                    color: #6c757d;
                    margin-bottom: 1rem;
                }
            }

            .product-actions {
                display: flex;
                gap: 0.5rem;

                button {
                    flex: 1;
                    padding: 0.5rem;
                    border: none;
                    border-radius: 0.25rem;
                    cursor: pointer;
                    font-weight: 500;

                    &:first-child {
                        background-color: #28a745;
                        color: white;
                    }

                    &:last-child {
                        background-color: #dc3545;
                        color: white;
                    }
                }
            }
        }
    }
</style>
