<script lang="ts">
    import { onMount } from "svelte";
    import {
        getSellerProducts,
        createProduct,
        updateProduct,
        deleteProduct,
    } from "../services/productService";
    import type { Product, ProductFormData } from "../types/product";

    let products: Product[] = [];
    let loading = true;
    let error: string | null = null;
    let success: string | null = null;
    let showCreateModal = false;
    let showEditModal = false;
    let currentProduct: Product | null = null;

    let formData: ProductFormData = {
        productName: "",
        productDescription: "",
        productImages: [],
        productPrice: 0,
        productStock: 0,
    };

    let newImage = "";

    onMount(async () => {
        await loadProducts();
    });

    const loadProducts = async () => {
        try {
            loading = true;
            products = await getSellerProducts();
            error = null;
        } catch (err) {
            error =
                err instanceof Error ? err.message : "Failed to load products";
        } finally {
            loading = false;
        }
    };

    const handleAddImage = () => {
        if (newImage.trim()) {
            formData.productImages = [
                ...formData.productImages,
                newImage.trim(),
            ];
            newImage = "";
        }
    };

    const handleRemoveImage = (index: number) => {
        formData.productImages = formData.productImages.filter(
            (_, i) => i !== index
        );
    };

    const handleCreateProduct = async () => {
        try {
            await createProduct(formData);
            success = "Product created successfully";
            error = null;
            showCreateModal = false;
            resetForm();
            await loadProducts();
        } catch (err) {
            error =
                err instanceof Error ? err.message : "Failed to create product";
            success = null;
        }
    };

    const handleEditProduct = async () => {
        if (!currentProduct) return;

        try {
            await updateProduct(currentProduct.productId, formData);
            success = "Product updated successfully";
            error = null;
            showEditModal = false;
            resetForm();
            await loadProducts();
        } catch (err) {
            error =
                err instanceof Error ? err.message : "Failed to update product";
            success = null;
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteProduct(productId);
                success = "Product deleted successfully";
                error = null;
                await loadProducts();
            } catch (err) {
                error =
                    err instanceof Error
                        ? err.message
                        : "Failed to delete product";
                success = null;
            }
        }
    };

    const openEditModal = (product: Product) => {
        currentProduct = product;
        formData = {
            productName: product.productName,
            productDescription: product.productDescription,
            productImages: [...product.productImages],
            productPrice: product.productPrice,
            productStock: product.productStock,
        };
        showEditModal = true;
    };

    const resetForm = () => {
        formData = {
            productName: "",
            productDescription: "",
            productImages: [],
            productPrice: 0,
            productStock: 0,
        };
        currentProduct = null;
    };
</script>

<div class="product-management">
    <h1>Manage Your Products</h1>

    {#if error}
        <div class="alert error">{error}</div>
    {/if}

    {#if success}
        <div class="alert success">{success}</div>
    {/if}

    <div class="actions">
        <button on:click={() => (showCreateModal = true)} class="btn primary">
            Add New Product
        </button>
    </div>

    {#if loading}
        <div class="loading">Loading products...</div>
    {:else}
        <div class="product-list">
            {#if products.length === 0}
                <div class="empty-state">You don't have any products yet.</div>
            {:else}
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each products as product (product.productId)}
                            <tr>
                                <td>{product.productName}</td>
                                <td>{product.productDescription}</td>
                                <td>${product.productPrice.toFixed(2)}</td>
                                <td>{product.productStock}</td>
                                <td class="actions">
                                    <button
                                        on:click={() => openEditModal(product)}
                                        class="btn secondary"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        on:click={() =>
                                            handleDeleteProduct(
                                                product.productId
                                            )}
                                        class="btn danger"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        </div>
    {/if}
</div>

<!-- Create Product Modal -->
{#if showCreateModal}
    <div class="modal">
        <div class="modal-content">
            <h2>Create New Product</h2>
            <form on:submit|preventDefault={handleCreateProduct}>
                <div class="form-group">
                    <label for="productName">Product Name</label>
                    <input
                        type="text"
                        id="productName"
                        bind:value={formData.productName}
                        required
                    />
                </div>

                <div class="form-group">
                    <label for="productDescription">Description</label>
                    <textarea
                        id="productDescription"
                        bind:value={formData.productDescription}
                        required
                    ></textarea>
                </div>

                <div class="form-group">
                    <label for="productPrice">Price ($)</label>
                    <input
                        type="number"
                        id="productPrice"
                        bind:value={formData.productPrice}
                        min="0"
                        step="0.01"
                        required
                    />
                </div>

                <div class="form-group">
                    <label for="productStock">Stock</label>
                    <input
                        type="number"
                        id="productStock"
                        bind:value={formData.productStock}
                        min="0"
                        required
                    />
                </div>

                <div class="form-group">
                    <label for="productImage">Image URL</label>
                    <div class="image-input">
                        <input
                            type="text"
                            id="productImage"
                            bind:value={newImage}
                            placeholder="Enter image URL"
                        />
                        <button
                            type="button"
                            class="btn small"
                            on:click={handleAddImage}>Add</button
                        >
                    </div>
                    {#if formData.productImages.length > 0}
                        <ul class="image-preview-list">
                            {#each formData.productImages as img, index}
                                <li>
                                    <img
                                        src={img}
                                        alt="Product Image"
                                        class="thumb"
                                    />
                                    <button
                                        type="button"
                                        on:click={() =>
                                            handleRemoveImage(index)}
                                        class="btn tiny danger">✕</button
                                    >
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </div>

                <div class="modal-actions">
                    <button type="submit" class="btn primary">Create</button>
                    <button
                        type="button"
                        on:click={() => {
                            showCreateModal = false;
                            resetForm();
                        }}
                        class="btn secondary"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Edit Product Modal -->
{#if showEditModal}
    <div class="modal">
        <div class="modal-content">
            <h2>Edit Product</h2>
            <form on:submit|preventDefault={handleEditProduct}>
                <div class="form-group">
                    <label for="editProductName">Product Name</label>
                    <input
                        type="text"
                        id="editProductName"
                        bind:value={formData.productName}
                        required
                    />
                </div>

                <div class="form-group">
                    <label for="editProductDescription">Description</label>
                    <textarea
                        id="editProductDescription"
                        bind:value={formData.productDescription}
                        required
                    ></textarea>
                </div>

                <div class="form-group">
                    <label for="editProductPrice">Price ($)</label>
                    <input
                        type="number"
                        id="editProductPrice"
                        bind:value={formData.productPrice}
                        min="0"
                        step="0.01"
                        required
                    />
                </div>

                <div class="form-group">
                    <label for="editProductStock">Stock</label>
                    <input
                        type="number"
                        id="editProductStock"
                        bind:value={formData.productStock}
                        min="0"
                        required
                    />
                </div>

                <div class="form-group">
                    <label for="editProductImage">Image URL</label>
                    <div class="image-input">
                        <input
                            type="text"
                            id="editProductImage"
                            bind:value={newImage}
                            placeholder="Enter image URL"
                        />
                        <button
                            type="button"
                            class="btn small"
                            on:click={handleAddImage}>Add</button
                        >
                    </div>
                    {#if formData.productImages.length > 0}
                        <ul class="image-preview-list">
                            {#each formData.productImages as img, index}
                                <li>
                                    <img
                                        src={img}
                                        alt="Product Image"
                                        class="thumb"
                                    />
                                    <button
                                        type="button"
                                        on:click={() =>
                                            handleRemoveImage(index)}
                                        class="btn tiny danger">✕</button
                                    >
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </div>

                <div class="modal-actions">
                    <button type="submit" class="btn primary">Update</button>
                    <button
                        type="button"
                        on:click={() => {
                            showEditModal = false;
                            resetForm();
                        }}
                        class="btn secondary"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
