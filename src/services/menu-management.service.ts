/**
 * Menu Management Service
 *
 * Handles all API operations related to menu items and add-ons management
 * Based on new API documentation for /api/menu endpoints
 */

import { apiService } from './api.service';
import {
  MenuItem,
  MenuItemsListResponse,
  MenuItemDetailsResponse,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  KitchenMenuResponse,
  MealMenuItemResponse,
  MenuType,
  MealWindow,
  DietaryType,
  MenuItemStatus,
  MenuItemCategory,
} from '../types/api.types';

export interface GetMenuItemsParams {
  kitchenId?: string;
  menuType?: MenuType;
  mealWindow?: MealWindow;
  category?: MenuItemCategory;
  dietaryType?: DietaryType;
  isAvailable?: boolean;
  status?: MenuItemStatus;
  search?: string;
  page?: number;
  limit?: number;
}

class MenuManagementService {
  /**
   * Get list of menu items with optional filters
   * GET /api/menu
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
    const endpoint = `/api/menu${queryString ? `?${queryString}` : ''}`;

    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: MenuItemsListResponse;
    }>(endpoint);

    return response.data;
  }

  /**
   * Get single menu item by ID
   * GET /api/menu/:id
   */
  async getMenuItemById(itemId: string): Promise<MenuItemDetailsResponse> {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: MenuItemDetailsResponse;
    }>(`/api/menu/${itemId}`);

    return response.data;
  }

  /**
   * Create new menu item
   * POST /api/menu
   */
  async createMenuItem(data: CreateMenuItemRequest): Promise<MenuItem> {
    const response = await apiService.post<{
      success: boolean;
      message: string;
      data: { menuItem: MenuItem };
    }>('/api/menu', data);

    return response.data.menuItem;
  }

  /**
   * Update menu item
   * PUT /api/menu/:id
   */
  async updateMenuItem(itemId: string, data: UpdateMenuItemRequest): Promise<MenuItem> {
    const response = await apiService.put<{
      success: boolean;
      message: string;
      data: { menuItem: MenuItem };
    }>(`/api/menu/${itemId}`, data);

    return response.data.menuItem;
  }

  /**
   * Delete menu item (soft delete)
   * DELETE /api/menu/:id
   */
  async deleteMenuItem(itemId: string): Promise<boolean> {
    const response = await apiService.delete<{
      success: boolean;
      message: string;
    }>(`/api/menu/${itemId}`);

    return response.success;
  }

  /**
   * Toggle menu item availability
   * PATCH /api/menu/:id/availability
   */
  async toggleAvailability(itemId: string, isAvailable: boolean): Promise<{ isAvailable: boolean }> {
    const response = await apiService.patch<{
      success: boolean;
      message: string;
      data: { isAvailable: boolean };
    }>(`/api/menu/${itemId}/availability`, { isAvailable });

    return response.data;
  }

  /**
   * Update add-ons attached to a menu item
   * PATCH /api/menu/:id/addons
   */
  async updateMenuItemAddons(itemId: string, addonIds: string[]): Promise<{
    menuItem: MenuItem;
    addons: any[];
  }> {
    const response = await apiService.patch<{
      success: boolean;
      message: string;
      data: {
        menuItem: MenuItem;
        addons: any[];
      };
    }>(`/api/menu/${itemId}/addons`, { addonIds });

    return response.data;
  }

  /**
   * Disable menu item (Admin only)
   * PATCH /api/menu/:id/disable
   */
  async disableMenuItem(itemId: string, reason: string): Promise<MenuItem> {
    const response = await apiService.patch<{
      success: boolean;
      message: string;
      data: { menuItem: MenuItem };
    }>(`/api/menu/${itemId}/disable`, { reason });

    return response.data.menuItem;
  }

  /**
   * Enable menu item (Admin only)
   * PATCH /api/menu/:id/enable
   */
  async enableMenuItem(itemId: string): Promise<MenuItem> {
    const response = await apiService.patch<{
      success: boolean;
      message: string;
      data: { menuItem: MenuItem };
    }>(`/api/menu/${itemId}/enable`);

    return response.data.menuItem;
  }

  /**
   * Get complete menu for a kitchen
   * GET /api/menu/kitchen/:kitchenId
   */
  async getKitchenMenu(kitchenId: string, menuType?: MenuType): Promise<KitchenMenuResponse> {
    const queryParams = menuType ? `?menuType=${menuType}` : '';
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: KitchenMenuResponse;
    }>(`/api/menu/kitchen/${kitchenId}${queryParams}`);

    return response.data;
  }

  /**
   * Get meal menu item for a specific window
   * GET /api/menu/kitchen/:kitchenId/meal/:mealWindow
   */
  async getMealMenuItem(kitchenId: string, mealWindow: MealWindow): Promise<MealMenuItemResponse> {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: MealMenuItemResponse;
    }>(`/api/menu/kitchen/${kitchenId}/meal/${mealWindow}`);

    return response.data;
  }

  /**
   * Get menu items filtered by kitchen
   */
  async getMenuItemsByKitchen(kitchenId: string): Promise<MenuItem[]> {
    const response = await this.getMenuItems({ kitchenId });
    return response.menuItems;
  }

  /**
   * Get menu items by menu type
   */
  async getMenuItemsByType(kitchenId: string, menuType: MenuType): Promise<MenuItem[]> {
    const response = await this.getMenuItems({ kitchenId, menuType });
    return response.menuItems;
  }

  /**
   * Get only available menu items
   */
  async getAvailableMenuItems(kitchenId: string): Promise<MenuItem[]> {
    const response = await this.getMenuItems({ kitchenId, isAvailable: true });
    return response.menuItems;
  }

  /**
   * Search menu items
   */
  async searchMenuItems(kitchenId: string, query: string): Promise<MenuItem[]> {
    const response = await this.getMenuItems({ kitchenId, search: query });
    return response.menuItems;
  }

  /**
   * Get disabled menu items (Admin only)
   */
  async getDisabledMenuItems(kitchenId?: string): Promise<MenuItem[]> {
    const response = await this.getMenuItems({
      kitchenId,
      status: 'DISABLED_BY_ADMIN'
    });
    return response.menuItems;
  }
}

export const menuManagementService = new MenuManagementService();
