export interface Product {
    id: number;
    counter: number;
    name: string;
    description: string;
    price: number;
    count?: number;
    imageUrl?: string;
}

// export interface Root {
//     categories: Category[]
// }

export interface Category {
    id: number
    name: string
    products: Product[]
}
