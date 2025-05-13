import { auth } from "../firebase";
import type { Order, CheckoutFormData } from "../types/order";

const API_BASE_URL = "/api/orders";

async function handleResponse(response: Response) {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Something went wrong");
    }
    return response.json();
}

export const submitOrder = async (
    formData: CheckoutFormData
): Promise<{ orderId: string }> => {
    try {
        // Ensure user is logged in
        if (!auth.currentUser) {
            throw new Error("You must be logged in to place an order");
        }

        // Get fresh ID token
        const idToken = await auth.currentUser.getIdToken(true);

        const response = await fetch(`${API_BASE_URL}/checkout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to place order");
        }

        return await response.json();
    } catch (error) {
        console.error("Order submission error:", error);
        throw error;
    }
};

export const getUserOrders = async (): Promise<Order[]> => {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(API_BASE_URL, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return handleResponse(response);
};
