import { requirement_budgetType } from '@prisma/client';

export class RequirementResponseDto {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget?: number;
  budgetType: requirement_budgetType;
  deadline?: Date;
  isUrgent: boolean;
  isActive: boolean;
  department?: string;
  course?: string;
  studentCount?: number;
  additionalRequirements?: string;
  preferredExpertise?: string;
  preferredLocation?: string;
  createdAt: Date;
  updatedAt: Date;
  collegeProfileId: string;
  collegeName?: string;
  contactPersonName?: string;
}
