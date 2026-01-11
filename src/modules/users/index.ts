/**
 * User Management Module Exports
 *
 * Complete user management system for admin dashboard
 */

// Main Screens (New Admin User Management)
export { UsersManagementScreen } from './screens/UsersManagementScreen';
export { UserDetailAdminScreen } from './screens/UserDetailAdminScreen';

// Legacy Screens (Customer-focused, keep for backwards compatibility)
export { UsersListScreen, UserDetailScreen } from './screens';

// Components
export { UserCard } from './components/UserCard';
export { RoleBadge } from './components/RoleBadge';
export { StatusBadge } from './components/StatusBadge';
export { CreateUserModal } from './components/CreateUserModal';
export { EditUserModal } from './components/EditUserModal';
export { SuspendUserModal } from './components/SuspendUserModal';
export { ResetPasswordModal } from './components/ResetPasswordModal';

// Service
export { adminUsersService } from '../../services/admin-users.service';
export type {
  GetUsersParams,
  CreateUserRequest,
  UpdateUserRequest,
  SuspendUserRequest,
  ResetPasswordRequest,
} from '../../services/admin-users.service';
