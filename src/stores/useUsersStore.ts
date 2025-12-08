import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UsersFilter, SortOption, UserRole, UserStatus } from '../types/user';
import { mockUsers, mockUserStats } from '../data/usersMockData';
import { STORAGE_KEYS } from '../utils/storageKeys';

export interface UsersState {
  users: User[];
  filteredUsers: User[];
  selectedUser: User | null;
  filter: UsersFilter;
  isLoading: boolean;
  error: string | null;
  stats: typeof mockUserStats;
}

const defaultFilter: UsersFilter = {
  userRoles: [],
  statuses: [],
  sortBy: 'name_asc',
  searchQuery: '',
};

export const useUsersStore = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<UsersFilter>(defaultFilter);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState(mockUserStats);

  // Apply filters and sorting
  const applyFilters = useCallback((usersList: User[], currentFilter: UsersFilter) => {
    let result = [...usersList];

    // Apply search
    if (currentFilter.searchQuery.trim()) {
      const query = currentFilter.searchQuery.toLowerCase().trim();
      result = result.filter(
        (user) =>
          user.fullName.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.phone.includes(query)
      );
    }

    // Apply role filter
    if (currentFilter.userRoles.length > 0) {
      result = result.filter((user) => currentFilter.userRoles.includes(user.role));
    }

    // Apply status filter
    if (currentFilter.statuses.length > 0) {
      result = result.filter((user) => currentFilter.statuses.includes(user.status));
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (currentFilter.sortBy) {
        case 'name_asc':
          return a.fullName.localeCompare(b.fullName);
        case 'name_desc':
          return b.fullName.localeCompare(a.fullName);
        case 'date_asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'date_desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'orders_high':
          return (b.totalOrders || 0) - (a.totalOrders || 0);
        case 'orders_low':
          return (a.totalOrders || 0) - (b.totalOrders || 0);
        default:
          return 0;
      }
    });

    return result;
  }, []);

  // Load users data
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to load from AsyncStorage first
      const storedData = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DATA);
      const storedFilter = await AsyncStorage.getItem(STORAGE_KEYS.USERS_FILTER);

      let usersData = mockUsers;
      let filterData = defaultFilter;

      if (storedData) {
        usersData = JSON.parse(storedData);
      }

      if (storedFilter) {
        filterData = JSON.parse(storedFilter);
      }

      setUsers(usersData);
      setFilter(filterData);
      setFilteredUsers(applyFilters(usersData, filterData));

      // Calculate stats
      const newStats = {
        totalUsers: usersData.length,
        activeUsers: usersData.filter((u: User) => u.status === 'ACTIVE').length,
        blockedUsers: usersData.filter((u: User) => u.status === 'BLOCKED').length,
        pendingUsers: usersData.filter((u: User) => u.status === 'PENDING' || u.status === 'UNVERIFIED').length,
        customerCount: usersData.filter((u: User) => u.role === 'customer').length,
        driverCount: usersData.filter((u: User) => u.role === 'driver').length,
        staffCount: usersData.filter((u: User) => u.role === 'kitchen_staff' || u.role === 'kitchen_admin').length,
      };
      setStats(newStats);
    } catch (err) {
      setError('Failed to load users data');
      // Fallback to mock data
      setUsers(mockUsers);
      setFilteredUsers(applyFilters(mockUsers, defaultFilter));
      setStats(mockUserStats);
    } finally {
      setIsLoading(false);
    }
  }, [applyFilters]);

  // Update filter
  const updateFilter = useCallback(
    async (newFilter: Partial<UsersFilter>) => {
      const updatedFilter = { ...filter, ...newFilter };
      setFilter(updatedFilter);
      setFilteredUsers(applyFilters(users, updatedFilter));

      // Persist filter to AsyncStorage
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.USERS_FILTER, JSON.stringify(updatedFilter));
      } catch {
        // Silently fail
      }
    },
    [filter, users, applyFilters]
  );

  // Reset filters
  const resetFilters = useCallback(async () => {
    setFilter(defaultFilter);
    setFilteredUsers(applyFilters(users, defaultFilter));

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USERS_FILTER, JSON.stringify(defaultFilter));
    } catch {
      // Silently fail
    }
  }, [users, applyFilters]);

  // Select user for details view
  const selectUser = useCallback(
    (userId: string) => {
      const user = users.find((u) => u.id === userId);
      setSelectedUser(user || null);
    },
    [users]
  );

  // Clear selected user
  const clearSelectedUser = useCallback(() => {
    setSelectedUser(null);
  }, []);

  // Update user status
  const updateUserStatus = useCallback(
    async (userId: string, newStatus: UserStatus) => {
      const updatedUsers = users.map((user) =>
        user.id === userId
          ? { ...user, status: newStatus, isActive: newStatus === 'ACTIVE', updatedAt: new Date().toISOString() }
          : user
      );

      setUsers(updatedUsers);
      setFilteredUsers(applyFilters(updatedUsers, filter));

      // Update selected user if it's the same
      if (selectedUser?.id === userId) {
        const updatedUser = updatedUsers.find((u) => u.id === userId);
        setSelectedUser(updatedUser || null);
      }

      // Persist to AsyncStorage
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.USERS_DATA, JSON.stringify(updatedUsers));
      } catch {
        // Silently fail
      }
    },
    [users, filter, selectedUser, applyFilters]
  );

  // Refresh data
  const refresh = useCallback(async () => {
    setIsLoading(true);
    // Simulate API call delay
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    await loadUsers();
  }, [loadUsers]);

  // Load data on mount
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    // State
    users,
    filteredUsers,
    selectedUser,
    filter,
    isLoading,
    error,
    stats,

    // Actions
    loadUsers,
    updateFilter,
    resetFilters,
    selectUser,
    clearSelectedUser,
    updateUserStatus,
    refresh,
  };
};
