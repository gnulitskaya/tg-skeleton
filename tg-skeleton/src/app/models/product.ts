export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    count?: number;
    imageUrl?: string;
}