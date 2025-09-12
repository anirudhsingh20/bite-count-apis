export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  initials: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  totalBites: number;
  totalCalories: number;
  averageBites: number;
  totalItems: number;
}

export interface UserSearchParams {
  query?: string;
  page?: number;
  limit?: number;
}
