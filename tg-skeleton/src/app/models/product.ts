export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    size: string;
    quantity: number;
    availableSizes: string[];
}

// export interface Root {
//     categories: Category[]
// }

export interface Category {
    id: number
    name: string
    products: Product[]
}
