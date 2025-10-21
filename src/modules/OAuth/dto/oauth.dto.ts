export interface GoogleLoginDTO {
  token: string;
  role?: 'user' | 'tenant';
}

export interface OAuthUserResponse {
  id: number;
  email: string;
  name: string | null;
  role: string;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OAuthLoginResponse {
  user: OAuthUserResponse;
  token: string;
  message: string;
}

