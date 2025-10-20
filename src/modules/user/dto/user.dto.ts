export interface UpdateUserDTO {
  name?: string;
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  address?: string;
  city?: string;
  country?: string;
  dateOfBirth?: Date | string;
}

export interface UserResponseDTO {
  id: number;
  name: string | null;
  email: string;
  role: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  dateOfBirth?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

