export interface Metadata {
    name: string;
    values: string[];
    subcategories?: Metadata[];
    isSelectable?: boolean;
}