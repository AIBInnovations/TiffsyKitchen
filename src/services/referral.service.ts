/**
 * Referral Service
 *
 * Handles all API operations related to the referral program
 * Endpoints: /api/referrals/admin/*
 */

import { apiService } from './api.service';
import {
  Referral,
  ReferralListResponse,
  ReferralAnalytics,
  ReferralConfig,
  GetReferralsParams,
  UserReferralDetails,
} from '../types/api.types';

class ReferralService {
  /**
   * Get all referrals with filters and pagination
   * GET /api/referrals/admin/list
   */
  async getReferrals(params?: GetReferralsParams): Promise<ReferralListResponse> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/referrals/admin/list${queryString ? `?${queryString}` : ''}`;

    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: ReferralListResponse;
    }>(endpoint);

    return response.data;
  }

  /**
   * Get referral program analytics
   * GET /api/referrals/admin/analytics
   */
  async getAnalytics(): Promise<ReferralAnalytics> {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: ReferralAnalytics;
    }>('/api/referrals/admin/analytics');

    return response.data;
  }

  /**
   * Get referral program configuration
   * GET /api/referrals/admin/config
   */
  async getConfig(): Promise<ReferralConfig> {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: ReferralConfig;
    }>('/api/referrals/admin/config');

    return response.data;
  }

  /**
   * Update referral program configuration
   * PUT /api/referrals/admin/config
   */
  async updateConfig(data: Partial<ReferralConfig>): Promise<ReferralConfig> {
    const response = await apiService.put<{
      success: boolean;
      message: string;
      data: ReferralConfig;
    }>('/api/referrals/admin/config', data);

    return response.data;
  }

  /**
   * Get referral details for a specific user
   * GET /api/referrals/admin/user/:userId
   */
  async getUserReferralDetails(userId: string): Promise<UserReferralDetails> {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: UserReferralDetails;
    }>(`/api/referrals/admin/user/${userId}`);

    return response.data;
  }
}

export const referralService = new ReferralService();
