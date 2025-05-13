export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
}

export interface Order {
    orderId: string;
    customer: string;
    items: OrderItem[];
    paymentMethod: string;
    shippingAddress: string;
    status: "Pending" | "Accepted" | "Shipped" | "Completed";
    timestamp: Date;
    total: number;
}

export interface CheckoutFormData {
    paymentMethod: string;
    shippingAddress: string;
}

export type OrderStatus = Order["status"];
