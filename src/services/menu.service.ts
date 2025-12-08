import { apiService } from './api.service';
import { MenuItem, Addon, Category } from '../types/menu';

class MenuService {
  // Menu Items
  async getMenuItems(): Promise<MenuItem[]> {
    return apiService.get<MenuItem[]>('/menu/items');
  }

  async getMenuItemById(itemId: string): Promise<MenuItem> {
    return apiService.get<MenuItem>(`/menu/items/${itemId}`);
  }

  async createMenuItem(data: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    return apiService.post<MenuItem>('/menu/items', data);
  }

  async updateMenuItem(itemId: string, data: Partial<MenuItem>): Promise<MenuItem> {
    return apiService.patch<MenuItem>(`/menu/items/${itemId}`, data);
  }

  async deleteMenuItem(itemId: string): Promise<void> {
    await apiService.delete(`/menu/items/${itemId}`);
  }

  async toggleItemAvailability(itemId: string, isAvailable: boolean): Promise<MenuItem> {
    return apiService.patch<MenuItem>(`/menu/items/${itemId}/availability`, { isAvailable });
  }

  // Addons
  async getAddons(): Promise<Addon[]> {
    return apiService.get<Addon[]>('/menu/addons');
  }

  async createAddon(data: Omit<Addon, 'id'>): Promise<Addon> {
    return apiService.post<Addon>('/menu/addons', data);
  }

  async updateAddon(addonId: string, data: Partial<Addon>): Promise<Addon> {
    return apiService.patch<Addon>(`/menu/addons/${addonId}`, data);
  }

  async deleteAddon(addonId: string): Promise<void> {
    await apiService.delete(`/menu/addons/${addonId}`);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return apiService.get<Category[]>('/menu/categories');
  }
}

export const menuService = new MenuService();
