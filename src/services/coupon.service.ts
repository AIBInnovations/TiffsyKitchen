/**
 * Coupon Service
 *
 * Handles all API operations related to coupon management
 * Based on API documentation for /api/coupons endpoints
 */

import { apiService } from './api.service';
import {
  Coupon,
  CouponListResponse,
  CouponDetailsResponse,
  CreateCouponRequest,
  UpdateCouponRequest,
  GetCouponsParams,
} from '../types/api.types';

class CouponService {
  /**
   * Get list of coupons with optional filters
   * GET /api/coupons
   */
  async getCoupons(params?: GetCouponsParams): Promise<CouponListResponse> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/coupons${queryString ? `?${queryString}` : ''}`;

    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: CouponListResponse;
    }>(endpoint);

    return response.data;
  }

  /**
   * Get single coupon by ID with usage stats
   * GET /api/coupons/:id
   */
  async getCouponById(couponId: string): Promise<CouponDetailsResponse> {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: CouponDetailsResponse;
    }>(`/api/coupons/${couponId}`);

    return response.data;
  }

  /**
   * Create new coupon
   * POST /api/coupons
   */
  async createCoupon(data: CreateCouponRequest): Promise<Coupon> {
    const response = await apiService.post<{
      success: boolean;
      message: string;
      data: { coupon: Coupon };
    }>('/api/coupons', data);

    return response.data.coupon;
  }

  /**
   * Update coupon
   * PUT /api/coupons/:id
   */
  async updateCoupon(couponId: string, data: UpdateCouponRequest): Promise<Coupon> {
    const response = await apiService.put<{
      success: boolean;
      message: string;
      data: { coupon: Coupon };
    }>(`/api/coupons/${couponId}`, data);

    return response.data.coupon;
  }

  /**
   * Activate coupon
   * PATCH /api/coupons/:id/activate
   */
  async activateCoupon(couponId: string): Promise<Coupon> {
    const response = await apiService.patch<{
      success: boolean;
      message: string;
      data: { coupon: Coupon };
    }>(`/api/coupons/${couponId}/activate`);

    return response.data.coupon;
  }

  /**
   * Deactivate coupon
   * PATCH /api/coupons/:id/deactivate
   */
  async deactivateCoupon(couponId: string): Promise<Coupon> {
    const response = await apiService.patch<{
      success: boolean;
      message: string;
      data: { coupon: Coupon };
    }>(`/api/coupons/${couponId}/deactivate`);

    return response.data.coupon;
  }

  /**
   * Delete coupon (only if never used)
   * DELETE /api/coupons/:id
   */
  async deleteCoupon(couponId: string): Promise<boolean> {
    const response = await apiService.delete<{
      success: boolean;
      message: string;
    }>(`/api/coupons/${couponId}`);

    return response.success;
  }
}

export const couponService = new CouponService();
