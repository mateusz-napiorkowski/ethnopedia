export interface Category {
    name: string;
    subcategories?: Category[];
    isNew?: boolean;
}