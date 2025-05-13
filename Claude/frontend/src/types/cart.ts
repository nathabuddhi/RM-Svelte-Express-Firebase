// types/cart.ts

export interface CartItem {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    stock: number;
    imageUrl?: string;
}

export interface CartResponse {
    items: CartItem[];
    totalItems: number;
}
