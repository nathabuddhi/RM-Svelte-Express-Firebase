export interface Product {
    productId: string;
    productName: string;
    productDescription: string;
    productImages: string[];
    productPrice: number;
    productStock: number;
    sellerId: string;
}

export interface ProductFormData {
    productName: string;
    productDescription: string;
    productImages: string[];
    productPrice: number;
    productStock: number;
}
