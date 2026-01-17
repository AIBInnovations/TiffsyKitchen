/**
 * Vouchers Service
 *
 * Handles voucher balance and management API calls
 */

import { apiService } from './api.service';

export interface VoucherBalance {
  total: number;
  available: number;
  redeemed: number;
  expired: number;
  restored: number;
  cancelled: number;
}

export interface ExpiringNext {
  count: number;
  date: string;
  daysRemaining: number;
}

export interface NextCutoff {
  mealWindow: 'LUNCH' | 'DINNER';
  cutoffTime: string;
  isPastCutoff: boolean;
  message: string;
}

export interface VoucherBalanceResponse {
  balance: VoucherBalance;
  expiringNext: ExpiringNext | null;
  canRedeemToday: boolean;
  nextCutoff: NextCutoff;
}

class VouchersService {
  /**
   * Get voucher balance for a user
   * GET /api/vouchers/balance
   * For admin: pass userId as query parameter
   */
  async getVoucherBalance(userId?: string): Promise<VoucherBalanceResponse> {
    const endpoint = userId ? `/api/vouchers/balance?userId=${userId}` : '/api/vouchers/balance';

    console.log(`🎫 Fetching voucher balance from: ${endpoint}`);

    const response = await apiService.get<any>(endpoint);

    console.log('🎫 Raw voucher response:', JSON.stringify(response, null, 2));

    // API returns: { status, message, data: { balance, expiringNext, ... } }
    // apiService.get returns the response directly (not wrapped)
    if (response.data) {
      console.log('✅ Voucher balance data found in response.data');
      return response.data;
    }

    // Fallback if the entire response is the data
    if (response.balance) {
      console.log('✅ Voucher balance found at root level');
      return response;
    }

    console.error('❌ Invalid voucher balance response structure:', response);
    throw new Error('Invalid voucher balance response');
  }

  /**
   * Get voucher balances for multiple users (admin only)
   * This will call the balance endpoint for each user
   */
  async getVoucherBalancesForUsers(userIds: string[]): Promise<Map<string, VoucherBalance>> {
    const balanceMap = new Map<string, VoucherBalance>();

    console.log(`🎫 Fetching voucher balances for ${userIds.length} users...`);

    // Fetch balances in parallel
    const promises = userIds.map(async (userId) => {
      try {
        console.log(`🎫 Fetching balance for user: ${userId}`);
        const response = await this.getVoucherBalance(userId);
        console.log(`✅ Balance fetched for ${userId}:`, response.balance);
        balanceMap.set(userId, response.balance);
      } catch (err: any) {
        console.error(`❌ Failed to fetch voucher balance for user ${userId}:`, err?.message || err);
        console.error('Full error:', err);
        // Set default balance on error
        balanceMap.set(userId, {
          total: 0,
          available: 0,
          redeemed: 0,
          expired: 0,
          restored: 0,
          cancelled: 0,
        });
      }
    });

    await Promise.all(promises);
    console.log(`🎫 Finished fetching balances. Map size: ${balanceMap.size}`);
    return balanceMap;
  }
}

export const vouchersService = new VouchersService();
