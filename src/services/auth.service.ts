import { apiService } from './api.service';
import { User, UserRole } from '../types/user';

interface LoginResponse {
  token: string;
  user: User;
}

// Set to true to use mock login (for testing without backend)
const USE_MOCK_LOGIN = true;

// Mock user data for testing
const mockUsers: Record<string, LoginResponse> = {
  'kitchen_staff': {
    token: 'mock-token-kitchen-staff-123',
    user: {
      id: '1',
      phone: '9876543210',
      email: 'kitchen@tiffsy.com',
      firstName: 'Kitchen',
      lastName: 'Staff',
      fullName: 'Kitchen Staff',
      role: 'kitchen_staff',
      isActive: true,
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  'driver': {
    token: 'mock-token-driver-456',
    user: {
      id: '2',
      phone: '9876543211',
      email: 'driver@tiffsy.com',
      firstName: 'Delivery',
      lastName: 'Driver',
      fullName: 'Delivery Driver',
      role: 'driver',
      isActive: true,
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
};

class AuthService {
  async login(username: string, password: string, role: UserRole): Promise<LoginResponse> {
    // Use mock login for testing
    if (USE_MOCK_LOGIN) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Accept any username/password for testing, just check role
          if (role === 'kitchen_staff' || role === 'driver') {
            const mockResponse = mockUsers[role];
            // Update name based on username
            mockResponse.user.firstName = username;
            mockResponse.user.fullName = username;
            resolve(mockResponse);
          } else {
            reject(new Error('Invalid role'));
          }
        }, 500); // Simulate network delay
      });
    }

    return apiService.post<LoginResponse>('/auth/staff/login', { username, password, role });
  }

  async sendOTP(phone: string): Promise<void> {
    await apiService.post('/auth/send-otp', { phone });
  }

  async verifyOTP(phone: string, otp: string): Promise<LoginResponse> {
    return apiService.post<LoginResponse>('/auth/verify-otp', { phone, otp });
  }

  async getProfile(): Promise<User> {
    if (USE_MOCK_LOGIN) {
      // Return mock profile
      return mockUsers['kitchen_staff'].user;
    }
    return apiService.get<User>('/auth/profile');
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiService.patch<User>('/auth/profile', data);
  }

  async logout(): Promise<void> {
    if (USE_MOCK_LOGIN) {
      return Promise.resolve();
    }
    await apiService.post('/auth/logout');
  }
}

export const authService = new AuthService();
