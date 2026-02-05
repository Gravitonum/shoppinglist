import apiClient from './client';

// Generic CRUD API factory
export const createEntityAPI = <T>(entityName: string) => {
    const baseURL = `/application/api/${entityName}`;

    return {
        // Get all records
        getAll: async (params?: Record<string, any>): Promise<T[]> => {
            const response = await apiClient.get<T[]>(baseURL, { params });
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
            // Standard REST: PUT to resource URL
            // @ts-ignore - we assume data has id
            const id = (data as any).id;
            const response = await apiClient.put<T>(`${baseURL}/${id}`, data);
            return response.data;
        },

        // Partially update record
        patch: async (data: Partial<T>): Promise<T> => {
            // "Item" entity requires PATCH to collection URL (backend quirk)
            if (entityName === 'Item') {
                const response = await apiClient.patch<T>(`${baseURL}`, data);
                return response.data;
            }

            // @ts-ignore - we assume data has id
            const id = (data as any).id;
            const response = await apiClient.patch<T>(`${baseURL}/${id}`, data);
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

export const appUsersAPI = createEntityAPI<User>('AppUser');
export const shoppingListsAPI = createEntityAPI<ShoppingList>('ShoppingList');
export const listMembersAPI = createEntityAPI<ListMember>('ListMember');
export const categoriesAPI = createEntityAPI<Category>('Category');
export const storesAPI = createEntityAPI<Store>('Store');
export const itemsAPI = createEntityAPI<Item>('Item');
export const templateListsAPI = createEntityAPI<TemplateList>('TemplateList');
export const templateItemsAPI = createEntityAPI<TemplateItem>('TemplateItem');
