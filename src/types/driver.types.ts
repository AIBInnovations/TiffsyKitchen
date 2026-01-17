/**
 * Driver-specific type definitions for Driver Approval System
 */

export type DriverApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type VehicleType = 'BIKE' | 'SCOOTER' | 'BICYCLE' | 'OTHER';
export type DocumentType = 'RC' | 'INSURANCE' | 'PUC' | 'OTHER';

export interface DriverDocument {
  type: DocumentType;
  imageUrl: string;
  expiryDate?: string;
}

export interface DriverDetails {
  licenseNumber?: string;
  licenseImageUrl?: string;
  licenseExpiryDate?: string;
  vehicleName?: string;
  vehicleNumber?: string;
  vehicleType?: VehicleType;
  vehicleDocuments?: DriverDocument[];
}

export interface ApprovalDetails {
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface Driver {
  _id: string;
  phone: string;
  firebaseUid: string;
  role: 'DRIVER';
  name: string;
  email?: string;
  profileImage?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  approvalStatus: DriverApprovalStatus;
  driverDetails?: DriverDetails;
  approvalDetails?: ApprovalDetails;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface DriverListResponse {
  success: boolean;
  message: string;
  data: {
    drivers: Driver[];
    pagination: PaginationMeta;
  };
}

export interface DriverDetailsResponse {
  success: boolean;
  message: string;
  data: {
    user: Driver;
  };
}

export interface DriverApprovalResponse {
  success: boolean;
  message: string;
  data: {
    user: Driver;
  };
}

export interface RejectDriverRequest {
  reason: string;
}

// Helper type for filtering
export interface DriverFilters extends PaginationParams {
  search?: string;
  vehicleType?: VehicleType;
  approvalStatus?: DriverApprovalStatus;
}

// UI State types
export interface DriverCardProps {
  driver: Driver;
  onPress: (driver: Driver) => void;
}

export interface ApproveDriverModalProps {
  visible: boolean;
  driver: Driver | null;
  onClose: () => void;
  onSuccess: () => void;
}

export interface RejectDriverModalProps {
  visible: boolean;
  driver: Driver | null;
  onClose: () => void;
  onSuccess: () => void;
}

export interface DriverDocumentViewerProps {
  visible: boolean;
  imageUrl: string;
  documentType: string;
  onClose: () => void;
}