import { UserRole } from '@prisma/client';

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    phone?: string | null;
    fullName: string;
    role: UserRole;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    createdAt: Date;
  };
  message: string;
  emailVerificationToken?: string | null;
  phoneVerificationToken?: string | null;
} 