export class ExpertProfileResponseDto {
  id: string;
  userId: string;
  jobTitle: string;
  company: string;
  experience?: string;
  location?: string;
  website?: string;
  primaryExpertise?: string;
  bio?: string;
  hourlyRate?: number;
  availableFor?: any;
  preferredMode?: string;
  isProfileComplete: boolean;
  isVerified: boolean;
  verificationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: any;
  skills?: any[];
  services?: any[];
  ratings?: any[];
  _count?: any;
  averageRating?: number;
  totalRatings?: number;
  totalServices?: number;
}
