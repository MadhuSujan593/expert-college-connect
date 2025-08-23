export class CollegeProfileResponseDto {
  id: string;
  userId: string;
  institutionName: string;
  contactPersonName: string;
  institutionType: string;
  accreditation?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  isProfileComplete: boolean;
  isVerified: boolean;
  verificationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: any;
  requirements?: any[];
  _count?: any;
  totalRequirements?: number;
  activeRequirements?: number;
}
