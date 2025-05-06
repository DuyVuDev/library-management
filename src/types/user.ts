export enum GenderType {
  Male = 0,
  Female = 1,
  Other = 2,
}

export enum UserRole {
  User = 1,
  SuperUser = 10,
  Admin = 100,
}

export interface UserResponseDTO {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  gender: GenderType;
  dateOfBirth: string;
  address: string;
  remainingRequests: number;
  role: UserRole;
}

export interface CreateUserRequestDTO {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  phoneNumber: string;
  gender: GenderType;
  dateOfBirth: string;
  address: string;
  role: UserRole;
}

export interface UpdateUserRequestDTO {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: GenderType;
  dateOfBirth: string;
  remainingRequests: number;
  address: string;
  role: UserRole;
}

export interface ChangePasswordRequestDTO {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequestDTO {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  gender: GenderType;
  dateOfBirth: string;
  address?: string;
}

export interface SignUpRequestDTO {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  phoneNumber: string;
  gender: GenderType;
  dateOfBirth: string;
  address?: string;
}

export interface LogInRequestDTO {
  userNameOrEmail: string;
  password: string;
}

export interface RefreshTokenRequestDTO {
  refreshToken: string;
}

export interface AuthResponseDTO {
  token: string;
  refreshToken: string;
}

export interface User {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: GenderType;
  dateOfBirth: string;
  address: string;
  role: string;
}
