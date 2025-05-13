<!-- CartItem.svelte -->
<script lang="ts">
    import type { CartItem } from "../types/cart";

    export let item: CartItem;
    export let onUpdateQuantity: (quantity: number) => void;
    export let onRemove: () => void;

    let quantity = item.quantity;

    function handleQuantityChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const newQuantity = parseInt(target.value, 10);

        if (newQuantity >= 1 && newQuantity <= item.stock) {
            quantity = newQuantity;
            onUpdateQuantity(newQuantity);
        }
    }
</script>

<div class="cart-item">
    <div class="cart-item-image">
        <img
            src={item.imageUrl || "/placeholder-product.jpg"}
            alt={item.productName}
        />
    </div>

    <div class="cart-item-details">
        <h3 class="cart-item-name">{item.productName}</h3>
        <p class="cart-item-price">${item.price.toFixed(2)}</p>
    </div>

    <div class="cart-item-quantity">
        <label for="quantity-{item.productId}">Qty:</label>
        <input
            type="number"
            id="quantity-{item.productId}"
            min="1"
            max={item.stock}
            bind:value={quantity}
            on:change={handleQuantityChange}
        />
        <span class="stock-info">Available: {item.stock}</span>
    </div>

    <div class="cart-item-subtotal">
        <p>${(item.price * quantity).toFixed(2)}</p>
    </div>

    <div class="cart-item-actions">
        <button class="remove-button" on:click={onRemove}> Remove </button>
    </div>
</div>
