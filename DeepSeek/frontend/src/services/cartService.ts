import { auth } from "../firebase";
import type { Product } from "../types/product";

export interface CartItem {
    productId: string;
    quantity: number;
    product: Product;
}

const API_BASE_URL = "http://localhost:5000/api/cart";

const getToken = async () => {
    return await auth.currentUser?.getIdToken();
};

export const getCart = async (): Promise<CartItem[]> => {
    const token = await getToken();
    const res = await fetch(API_BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to load cart");
    return await res.json();
};

export const addOrUpdateCartItem = async (
    productId: string,
    quantity: number
) => {
    const token = await getToken();
    const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
    });
    if (!res.ok) throw new Error("Failed to update cart");
    return await res.json();
};

export const deleteCartItem = async (productId: string) => {
    const token = await getToken();
    const res = await fetch(`${API_BASE_URL}/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete item");
    return await res.json();
};
