export interface Metadata {
    name: string;
    value: string;
    subcategories?: Metadata[];
    isSelectable?: boolean;
}