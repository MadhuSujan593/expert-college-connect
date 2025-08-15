import { UserRole } from '@prisma/client';

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    phone?: string | null;
    fullName: string;
    role: UserRole;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    expertProfile?: any;
    collegeProfile?: any;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  message: string;
} 