import { Zone, ZoneStatus } from '../../../types/api.types';

/**
 * Zone Management Module Types
 */

// Filter options
export interface ZoneFilters {
  city?: string;
  status?: ZoneStatus | 'ALL';
  orderingEnabled?: boolean;
  search?: string;
}

// Form state for create/edit
export interface ZoneFormData {
  pincode: string;
  name: string;
  city: string;
  state: string;
  timezone: string;
  status: 'ACTIVE' | 'INACTIVE';
  orderingEnabled: boolean;
  displayOrder: number;
}

// UI State
export interface ZonesScreenState {
  zones: Zone[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  totalCount: number;
}

export interface ZoneFormState {
  pincode: string;
  name: string;
  city: string;
  state: string;
  timezone: string;
  status: 'ACTIVE' | 'INACTIVE';
  orderingEnabled: boolean;
  displayOrder: number;
}

export interface ZoneFormErrors {
  pincode?: string;
  name?: string;
  city?: string;
  state?: string;
  timezone?: string;
  displayOrder?: string;
}

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal',
  'Delhi',
  'Other',
];

export const TIMEZONES = [
  { label: 'Asia/Kolkata (IST)', value: 'Asia/Kolkata' },
  { label: 'Asia/Dubai (GST)', value: 'Asia/Dubai' },
  { label: 'America/New_York (EST)', value: 'America/New_York' },
  { label: 'Europe/London (GMT)', value: 'Europe/London' },
];
