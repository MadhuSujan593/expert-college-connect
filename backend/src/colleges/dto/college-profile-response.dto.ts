import { collegeprofile_institutionType } from '@prisma/client';

export class CollegeProfileResponseDto {
  id: string;
  userId: string;
  institutionName: string;
  contactPersonName: string;
  institutionType: collegeprofile_institutionType;
  accreditation?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  logoUrl?: string;
  description?: string;
  isProfileComplete: boolean;
  isVerified: boolean;
  verificationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  profileCompleteness: number;
  user: {
    id: string;
    email: string;
    fullName: string;
    profileImage?: string;
  };
}
