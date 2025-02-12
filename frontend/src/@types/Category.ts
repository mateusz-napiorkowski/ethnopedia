export interface Category {
    name: string;
    values?: string[];
    subcategories?: Category[];
    isSelectable?: boolean;
}