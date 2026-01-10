/**
 * Menu Service
 *
 * Handles all API operations related to menu items management
 * Based on API endpoint: /api/kitchen/menu-items
 */

import { apiService } from './api.service';
import {
  MenuItem,
  MenuItemsListResponse,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  MealType,
  FoodType,
} from '../types/api.types';

export interface GetMenuItemsParams {
  mealType?: MealType;
  foodType?: FoodType;
  available?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

class MenuService {
  /**
   * Get list of menu items with optional filters
   * GET /api/kitchen/menu-items
   */
  async getMenuItems(params?: GetMenuItemsParams): Promise<MenuItemsListResponse> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/kitchen/menu-items${queryString ? `?${queryString}` : ''}`;

    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: MenuItemsListResponse;
    }>(endpoint);

    return response.data;
  }

  /**
   * Get single menu item by ID
   * GET /api/kitchen/menu-items/:id
   */
  async getMenuItemById(itemId: string): Promise<MenuItem> {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { item: MenuItem };
    }>(`/api/kitchen/menu-items/${itemId}`);

    return response.data.item;
  }

  /**
   * Create new menu item
   * POST /api/kitchen/menu-items
   * Content-Type: multipart/form-data
   */
  async createMenuItem(data: CreateMenuItemRequest): Promise<MenuItem> {
    const formData = new FormData();

    // Add all fields to FormData
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', String(data.price));
    formData.append('foodType', data.foodType);
    formData.append('isJainFriendly', String(data.isJainFriendly));
    formData.append('spiceLevel', data.spiceLevel);
    formData.append('isAvailable', String(data.isAvailable));
    formData.append('mealTypes', JSON.stringify(data.mealTypes));

    if (data.category) {
      formData.append('category', data.category);
    }

    if (data.preparationTime) {
      formData.append('preparationTime', String(data.preparationTime));
    }

    // Add image if provided
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await apiService.post<{
      success: boolean;
      message: string;
      data: { item: MenuItem };
    }>('/api/kitchen/menu-items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.item;
  }

  /**
   * Update menu item
   * PUT /api/kitchen/menu-items/:id
   * Content-Type: multipart/form-data
   */
  async updateMenuItem(itemId: string, data: Partial<CreateMenuItemRequest>): Promise<MenuItem> {
    const formData = new FormData();

    // Add only provided fields
    if (data.name !== undefined) formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.price !== undefined) formData.append('price', String(data.price));
    if (data.foodType !== undefined) formData.append('foodType', data.foodType);
    if (data.isJainFriendly !== undefined)
      formData.append('isJainFriendly', String(data.isJainFriendly));
    if (data.spiceLevel !== undefined) formData.append('spiceLevel', data.spiceLevel);
    if (data.isAvailable !== undefined) formData.append('isAvailable', String(data.isAvailable));
    if (data.mealTypes !== undefined) formData.append('mealTypes', JSON.stringify(data.mealTypes));
    if (data.category !== undefined) formData.append('category', data.category);
    if (data.preparationTime !== undefined)
      formData.append('preparationTime', String(data.preparationTime));

    // Add image if provided
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await apiService.put<{
      success: boolean;
      message: string;
      data: { item: MenuItem };
    }>(`/api/kitchen/menu-items/${itemId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.item;
  }

  /**
   * Delete menu item
   * DELETE /api/kitchen/menu-items/:id
   */
  async deleteMenuItem(itemId: string): Promise<boolean> {
    const response = await apiService.delete<{
      success: boolean;
      message: string;
    }>(`/api/kitchen/menu-items/${itemId}`);

    return response.success;
  }

  /**
   * Toggle menu item availability
   * PATCH /api/kitchen/menu-items/:id/availability
   */
  async toggleAvailability(itemId: string, available: boolean): Promise<MenuItem> {
    const response = await apiService.patch<{
      success: boolean;
      message: string;
      data: { item: MenuItem };
    }>(`/api/kitchen/menu-items/${itemId}/availability`, {
      available,
    });

    return response.data.item;
  }

  /**
   * Get menu items by meal type
   */
  async getMenuItemsByMealType(mealType: MealType): Promise<MenuItem[]> {
    const response = await this.getMenuItems({ mealType });
    return response.items;
  }

  /**
   * Get menu items by food type
   */
  async getMenuItemsByFoodType(foodType: FoodType): Promise<MenuItem[]> {
    const response = await this.getMenuItems({ foodType });
    return response.items;
  }

  /**
   * Get only available menu items
   */
  async getAvailableMenuItems(): Promise<MenuItem[]> {
    const response = await this.getMenuItems({ available: true });
    return response.items;
  }

  /**
   * Search menu items
   */
  async searchMenuItems(query: string): Promise<MenuItem[]> {
    const response = await this.getMenuItems({ search: query });
    return response.items;
  }
}

export const menuService = new MenuService();
