import { requirement_budgetType } from '@prisma/client';

export class RequirementResponseDto {
  id: string;
  collegeProfileId: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget?: number;
  budgetType: requirement_budgetType;
  deadline?: Date;
  isUrgent: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
