import { auth } from "../firebase";
import type { Product, ProductFormData } from "../types/product";

const API_BASE_URL = "http://localhost:5000/api/products";

async function handleResponse(response: Response) {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Something went wrong");
    }
    return response.json();
}

export const getSellerProducts = async (): Promise<Product[]> => {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(API_BASE_URL, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return handleResponse(response);
};

export const createProduct = async (
    productData: ProductFormData
): Promise<Product> => {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
    });
    return handleResponse(response);
};

export const updateProduct = async (
    productId: string,
    productData: Partial<ProductFormData>
): Promise<Product> => {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_BASE_URL}/${productId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
    });
    return handleResponse(response);
};

export const deleteProduct = async (
    productId: string
): Promise<{ success: boolean }> => {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_BASE_URL}/${productId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return handleResponse(response);
};

