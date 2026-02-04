import apiClient from './client';

// Generic CRUD API factory
export const createEntityAPI = <T>(entityName: string) => {
    const baseURL = `/application/api/${entityName}`;

    return {
        // Get all records
        getAll: async (): Promise<T[]> => {
            const response = await apiClient.get<T[]>(baseURL);
            return response.data;
        },

        // Get single record by ID
        getById: async (id: string): Promise<T> => {
            const response = await apiClient.get<T>(`${baseURL}/${id}`);
            return response.data;
        },

        // Create new record
        create: async (data: Partial<T>): Promise<T> => {
            const response = await apiClient.post<T>(baseURL, data);
            return response.data;
        },

        // Update record (full replacement)
        update: async (data: T): Promise<T> => {
            const response = await apiClient.put<T>(baseURL, data);
            return response.data;
        },

        // Partially update record
        patch: async (data: Partial<T>): Promise<T> => {
            const response = await apiClient.patch<T>(baseURL, data);
            return response.data;
        },

        // Delete record
        delete: async (id: string): Promise<void> => {
            await apiClient.delete(`${baseURL}/${id}`);
        },
    };
};

// Export entity-specific APIs
import type {
    User,
    ShoppingList,
    ListMember,
    Category,
    Store,
    Item,
    TemplateList,
    TemplateItem,
} from '@/types/entities';

export const usersAPI = createEntityAPI<User>('User');
export const shoppingListsAPI = createEntityAPI<ShoppingList>('ShoppingList');
export const listMembersAPI = createEntityAPI<ListMember>('ListMember');
export const categoriesAPI = createEntityAPI<Category>('Category');
export const storesAPI = createEntityAPI<Store>('Store');
export const itemsAPI = createEntityAPI<Item>('Item');
export const templateListsAPI = createEntityAPI<TemplateList>('TemplateList');
export const templateItemsAPI = createEntityAPI<TemplateItem>('TemplateItem');
