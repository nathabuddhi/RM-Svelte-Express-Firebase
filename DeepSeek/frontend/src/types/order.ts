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
    status: string;
    timestamp: Date;
    total: number;
}

export interface CheckoutFormData {
    paymentMethod: string;
    shippingAddress: string;
}
