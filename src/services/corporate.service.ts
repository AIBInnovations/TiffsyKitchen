/**
 * Corporate Meals admin API — corporates CRUD, per-corporate plans,
 * partnership leads inbox. Mirrors admin-dashboard.service's enhanced-API
 * usage (auto token refresh, retry, dedup).
 */
import { apiService as enhancedApiService } from './api.enhanced.service';

export interface CorporateLockedAddress {
  addressLine1: string;
  addressLine2?: string;
  locality: string;
  city: string;
  state?: string;
  pincode: string;
  coordinates: { latitude: number; longitude: number };
}

export interface Corporate {
  _id: string;
  name: string;
  code: string;
  status: 'ACTIVE' | 'INACTIVE';
  lockedAddress: CorporateLockedAddress;
  maxMealsPerWindow: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
  memberCount?: number;
  activePlanCount?: number;
  createdAt?: string;
}

export interface CorporatePlan {
  _id: string;
  corporateId: string;
  name: string;
  description?: string;
  voucherCount: number;
  price: number;
  originalPrice?: number | null;
  voucherValidityDays: number;
  taxRate?: number;
  taxInclusive?: boolean;
  perMealDeliveryFee: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  displayOrder?: number;
}

export interface CorporateLead {
  _id: string;
  userId?: { _id: string; name?: string; phone?: string } | string;
  companyName: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  message?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  corporateId?: { _id: string; name?: string; code?: string } | string | null;
  createdAt?: string;
}

export interface CreateCorporateInput {
  name: string;
  code: string;
  lockedAddress: CorporateLockedAddress;
  maxMealsPerWindow: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
  sourceLeadId?: string | null;
}

export interface CreateCorporatePlanInput {
  name: string;
  description?: string;
  voucherCount: number;
  price: number;
  originalPrice?: number | null;
  voucherValidityDays: number;
  perMealDeliveryFee: number;
  displayOrder?: number;
}

class CorporateService {
  async listCorporates(): Promise<Corporate[]> {
    const response = await enhancedApiService.get<{ corporates: Corporate[] }>('/api/corporate');
    return response.data?.corporates || [];
  }

  async getCorporate(id: string): Promise<{ corporate: Corporate; plans: CorporatePlan[]; memberCount: number }> {
    const response = await enhancedApiService.get<{ corporate: Corporate; plans: CorporatePlan[]; memberCount: number }>(
      `/api/corporate/${id}`,
    );
    return response.data;
  }

  async createCorporate(input: CreateCorporateInput): Promise<Corporate> {
    const response = await enhancedApiService.post<{ corporate: Corporate }>('/api/corporate', input);
    return response.data?.corporate;
  }

  async updateCorporate(id: string, input: Partial<CreateCorporateInput> & { status?: 'ACTIVE' | 'INACTIVE' }): Promise<Corporate> {
    const response = await enhancedApiService.put<{ corporate: Corporate }>(`/api/corporate/${id}`, input);
    return response.data?.corporate;
  }

  async createPlan(corporateId: string, input: CreateCorporatePlanInput): Promise<CorporatePlan> {
    const response = await enhancedApiService.post<{ plan: CorporatePlan }>(`/api/corporate/${corporateId}/plans`, input);
    return response.data?.plan;
  }

  async updatePlan(planId: string, input: Partial<CreateCorporatePlanInput> & { status?: CorporatePlan['status'] }): Promise<CorporatePlan> {
    const response = await enhancedApiService.put<{ plan: CorporatePlan }>(`/api/corporate/plans/${planId}`, input);
    return response.data?.plan;
  }

  async listLeads(status?: string): Promise<CorporateLead[]> {
    const qs = status ? `?status=${status}` : '';
    const response = await enhancedApiService.get<{ leads: CorporateLead[] }>(`/api/corporate/leads/inbox${qs}`);
    return response.data?.leads || [];
  }

  async rejectLead(id: string, reviewNotes?: string): Promise<void> {
    await enhancedApiService.post(`/api/corporate/leads/${id}/reject`, { reviewNotes: reviewNotes || null });
  }
}

export const corporateService = new CorporateService();
export default corporateService;
