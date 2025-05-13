export interface Order {
    orderId: string; // UUID
    productId: string;
    quantity: number;
    status: "pending" | "accepted" | "shipped" | "completed";
    customer: string; // email
    timestamp: string; // ISO date string
    product?: {
        productName: string;
        productImages: string[];
        productPrice: number;
    };
}
