// Entity Types mapped from GraviBase backend

export interface User {
    id: string;
    email?: string;
    displayName?: string;
}

export interface ShoppingList {
    id: string;
    owner?: string; // Reference to User ID
    title?: string;
    isShared?: boolean;
}

export interface ListMember {
    id: string;
    list?: string; // Reference to ShoppingList ID
    user?: string; // Reference to User ID
    role?: string; // viewer, editor, admin
    joinedAt?: string; // ISO datetime string
}

export interface Category {
    id: string;
    title?: string;
    color?: string;
    sortOrder?: number;
}

export interface Store {
    id: string;
    name?: string;
    type?: string;
    address?: string;
}

export interface Item {
    id: string;
    list?: string; // Reference to ShoppingList ID
    title?: string;
    quantity?: number;
    unit?: string;
    note?: string;
    category?: string; // Reference to Category ID
    store?: string; // Reference to Store ID
    isChecked?: boolean;
    position?: number;
}

export interface TemplateList {
    id: string;
    owner?: string; // Reference to User ID
    title?: string;
    description?: string;
}

export interface TemplateItem {
    id: string;
    templateList?: string; // Reference to TemplateList ID
    title?: string;
    quantity?: number;
    unit?: string;
    category?: string; // Reference to Category ID
    store?: string; // Reference to Store ID
    position?: number;
}

// Extended types with populated references (for UI display)
export interface ItemWithRefs extends Item {
    categoryData?: Category;
    storeData?: Store;
}

export interface ShoppingListWithStats extends ShoppingList {
    itemCount?: number;
    checkedCount?: number;
    ownerData?: User;
}
