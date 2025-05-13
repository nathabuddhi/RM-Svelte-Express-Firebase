import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import type { Product } from "../types/product";

export interface CartItem {
    productId: string;
    quantity: number;
    product: Product;
}

const API_BASE_URL = "http://localhost:5000/api/cart";

const getToken = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe(); // prevent multiple calls
            if (!user) {
                return reject(new Error("User not logged in"));
            }
            try {
                const token = await user.getIdToken();
                resolve(token);
            } catch (err) {
                reject(err);
            }
        });
    });
};

export const getCart = async (): Promise<CartItem[]> => {
    const token = await getToken();
    console.log("Token:", token);
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
