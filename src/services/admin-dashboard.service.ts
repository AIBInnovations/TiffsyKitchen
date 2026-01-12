import enhancedApiService from './api.enhanced.service';

export interface DashboardOverview {
  totalOrders: number;
  totalRevenue: number;
  activeCustomers: number;
  activeKitchens: number;
}

export interface DashboardToday {
  orders: number;
  revenue: number;
  newCustomers: number;
}

export interface PendingActions {
  pendingOrders: number;
  pendingRefunds: number;
  pendingKitchenApprovals: number;
}

export interface ActivityItem {
  _id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: {
    _id: string;
    name: string;
    role: string;
  };
  createdAt: string;
}

export interface DashboardData {
  overview: DashboardOverview;
  today: DashboardToday;
  pendingActions: PendingActions;
  recentActivity: ActivityItem[];
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  totalVouchersUsed: number;
  avgOrderValue: number;
  byStatus: Record<string, number>;
  byMenuType: {
    MEAL_MENU: number;
    ON_DEMAND_MENU: number;
  };
}

export interface DeliveryStats {
  totalBatches: number;
  totalDeliveries: number;
  successRate: number;
  totalFailed: number;
  byZone: Array<{
    _id: string;
    zone: string;
    deliveries: number;
    successRate: number;
  }>;
}

export interface VoucherStats {
  totalIssued: number;
  totalRedeemed: number;
  totalExpired: number;
  totalAvailable: number;
  totalRestored: number;
  totalCancelled: number;
  redemptionRate: string;
  expiryRate: string;
  byMealWindow: {
    lunch: { redeemed: number };
    dinner: { redeemed: number };
  };
}

export interface RefundStats {
  totalRefunds: number;
  totalAmount: number;
  completedRefunds: number;
  failedRefunds: number;
  successRate: number;
  avgProcessingTimeHours: number;
  byStatus: Record<string, { count: number; amount: number }>;
  byReason: Record<string, number>;
}

export interface ReportSegment {
  _id: string;
  totalOrders?: number;
  totalValue?: number;
  avgOrderValue?: number;
  entity: {
    _id: string;
    name: string;
  };
}

export interface Report {
  type: string;
  segmentBy: string;
  data: ReportSegment[];
}

export interface AuditLog {
  _id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: {
    _id: string;
    name: string;
    role: string;
  };
  details?: Record<string, any>;
  createdAt: string;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SystemConfig {
  cutoffTimes: {
    lunch: string;
    dinner: string;
  };
  cancellation: {
    windowMinutes: number;
    voucherOrdersAnytime: boolean;
  };
  fees: {
    deliveryFee: number;
    serviceFee: number;
    packagingFee: number;
    handlingFee: number;
    taxRate: number;
  };
  batching: {
    maxBatchSize: number;
    failedOrderPolicy: string;
    autoDispatchDelay: number;
  };
  taxes: Array<{
    name: string;
    rate: number;
    enabled: boolean;
  }>;
  refund: {
    maxRetries: number;
    autoProcessDelay: number;
  };
}

export interface DeliveryConfig {
  maxBatchSize: number;
  failedOrderPolicy: string;
  autoDispatchDelay: number;
}

export interface User {
  _id: string;
  phone: string;
  name: string;
  email?: string;
  role: string;
  status: string;
  kitchenId?: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

export interface UsersResponse {
  users: User[];
  counts: {
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class AdminDashboardService {
  /**
   * Get main dashboard overview with key metrics
   */
  async getDashboard(): Promise<DashboardData> {
    const response = await enhancedApiService.get<{ data: DashboardData }>('/api/admin/dashboard');
    return response.data;
  }

  /**
   * Generate detailed reports by type with optional segmentation
   */
  async getReports(params: {
    type: 'ORDERS' | 'REVENUE' | 'VOUCHERS' | 'REFUNDS';
    segmentBy?: 'KITCHEN' | 'ZONE';
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Report> {
    const response = await enhancedApiService.get<{ data: { report: Report } }>('/api/admin/reports', { params });
    return response.data.report;
  }

  /**
   * Get order statistics with filters
   */
  async getOrderStats(params?: {
    dateFrom?: string;
    dateTo?: string;
    kitchenId?: string;
  }): Promise<OrderStats> {
    const response = await enhancedApiService.get<{ data: OrderStats }>('/api/orders/admin/stats', { params });
    return response.data;
  }

  /**
   * Get delivery performance statistics
   */
  async getDeliveryStats(params?: {
    dateFrom?: string;
    dateTo?: string;
    zoneId?: string;
  }): Promise<DeliveryStats> {
    const response = await enhancedApiService.get<{ data: DeliveryStats }>('/api/delivery/admin/stats', { params });
    return response.data;
  }

  /**
   * Get voucher statistics
   */
  async getVoucherStats(): Promise<VoucherStats> {
    const response = await enhancedApiService.get<{ data: VoucherStats }>('/api/vouchers/admin/stats');
    return response.data;
  }

  /**
   * Get refund statistics
   */
  async getRefundStats(params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<RefundStats> {
    const response = await enhancedApiService.get<{ data: RefundStats }>('/api/refunds/admin/stats', { params });
    return response.data;
  }

  /**
   * Get audit logs with pagination and filtering
   */
  async getAuditLogs(params?: {
    action?: string;
    entityType?: string;
    page?: number;
    limit?: number;
  }): Promise<AuditLogsResponse> {
    const response = await enhancedApiService.get<{ data: AuditLogsResponse }>('/api/admin/audit-logs', { params });
    return response.data;
  }

  /**
   * Get audit log detail by ID
   */
  async getAuditLogDetail(id: string): Promise<AuditLog> {
    const response = await enhancedApiService.get<{ data: AuditLog }>(`/api/admin/audit-logs/${id}`);
    return response.data;
  }

  /**
   * Get system configuration
   */
  async getSystemConfig(): Promise<SystemConfig> {
    const response = await enhancedApiService.get<{ data: { config: SystemConfig } }>('/api/admin/config');
    return response.data.config;
  }

  /**
   * Update system configuration
   */
  async updateSystemConfig(config: Partial<SystemConfig>): Promise<SystemConfig> {
    const response = await enhancedApiService.put<{ data: { config: SystemConfig } }>('/api/admin/config', config);
    return response.data.config;
  }

  /**
   * Get delivery configuration
   */
  async getDeliveryConfig(): Promise<DeliveryConfig> {
    const response = await enhancedApiService.get<{ data: { config: DeliveryConfig } }>('/api/delivery/config');
    return response.data.config;
  }

  /**
   * Update delivery configuration
   */
  async updateDeliveryConfig(config: Partial<DeliveryConfig>): Promise<DeliveryConfig> {
    const response = await enhancedApiService.put<{ data: { config: DeliveryConfig } }>('/api/delivery/config', config);
    return response.data.config;
  }

  /**
   * Get users list with filtering
   */
  async getUsers(params?: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<UsersResponse> {
    const response = await enhancedApiService.get<{ data: UsersResponse }>('/api/admin/users', { params });
    return response.data;
  }

  /**
   * Export report
   */
  async exportReport(params: {
    type: 'ORDERS' | 'REVENUE' | 'VOUCHERS' | 'REFUNDS';
    segmentBy?: 'KITCHEN' | 'ZONE';
    dateFrom?: string;
    dateTo?: string;
    format?: 'CSV' | 'XLSX';
  }): Promise<Blob> {
    const response = await enhancedApiService.get('/api/admin/reports/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }
}

export default new AdminDashboardService();