import type { Product } from "../types/product";

export const getAllAvailableProducts = async (): Promise<Product[]> => {
    try {
        const response = await fetch("/api/search");
        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};

export const searchProducts = async (
    searchTerm: string
): Promise<Product[]> => {
    try {
        const response = await fetch(
            `/api/search/${encodeURIComponent(searchTerm)}`
        );
        if (!response.ok) {
            throw new Error("Failed to search products");
        }
        return await response.json();
    } catch (error) {
        console.error("Error searching products:", error);
        throw error;
    }
};
