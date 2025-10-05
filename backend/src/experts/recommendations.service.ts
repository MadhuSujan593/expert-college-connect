import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SkillMatch {
  skill: string;
  matched: boolean;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';
}

export interface RecommendationScore {
  requirementId: string;
  score: number; // Now percentage-based (0-100)
  matchedSkills: SkillMatch[];
  unmatchedSkills: string[];
  skillScore: number; // Raw skill points
  reasonScore: number; // Raw reason points  
  urgencyScore: number; // Raw urgency points
  budgetScore: number; // Raw budget points
}

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  async getRecommendedOpportunities(
    userId: string,
    page: number = 1,
    limit: number = 10,
    minScore: number = 20,
  ) {
    // Get expert profile and skills
    const expertProfile = await this.prisma.expertprofile.findUnique({
      where: { userId },
      include: {
        expertskill: {
          select: {
            skillName: true,
            skillLevel: true,
          },
        },
      },
    });

    if (!expertProfile) {
      throw new NotFoundException('Expert profile not found');
    }

    if (!expertProfile.expertskill || expertProfile.expertskill.length === 0) {
      return {
        opportunities: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
        summary: {
          message: 'Add skills to your profile to get personalized recommendations',
          expertSkillCount: 0,
        },
      };
    }

    const expertSkills = expertProfile.expertskill.map(skill => ({
      name: skill.skillName.toLowerCase(),
      level: skill.skillLevel,
    }));

    // Fetch all active requirements with pagination
    const skip = (page - 1) * limit;
    const requirements = await this.prisma.requirement.findMany({
      where: {
        isActive: true,
        // Exclude requirements already applied by this expert
        applications: {
          none: {
            expertId: userId,
          },
        },
      },
      include: {
        collegeprofile: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate recommendation scores
    const recommendations = await Promise.all(
      requirements.map(async (req) => {
        return await this.calculateRecommendationScore(req, expertSkills);
      }),
    );

    // Filter by minimum score and sort by score
    const filteredRecommendations = recommendations
      .filter(rec => rec.score >= minScore)
      .sort((a, b) => b.score - a.score);

    // For pagination, we need total count - in real implementation,
    // you'd want to optimize this query
    const totalRequirements = await this.prisma.requirement.count({
      where: {
        isActive: true,
        applications: {
          none: {
            expertId: userId,
          },
        },
      },
    });

    return {
        opportunities: await Promise.all(filteredRecommendations.map(async (rec) => {
        const requirement = requirements.find(r => r.id === rec.requirementId);
        if (!requirement) return null;
        
        // Get college profile data separately since include might not be working
        const collegeProfile = await this.prisma.collegeprofile.findUnique({
          where: { id: requirement.collegeProfileId },
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        });

        if (!collegeProfile) return null;
        
        return {
          id: requirement.id,
          title: requirement.title,
          description: requirement.description,
          category: requirement.category,
          subcategory: requirement.subcategory,
          budget: requirement.budget ? requirement.budget.toNumber() : null,
          budgetType: requirement.budgetType,
          deadline: requirement.deadline,
          isUrgent: requirement.isUrgent,
          requiredSkills: requirement.requiredSkills,
          experience: requirement.experience,
          college: {
            id: collegeProfile.id,
            name: collegeProfile.institutionName,
            contactName: collegeProfile.user.fullName,
            email: collegeProfile.user.email,
            logoUrl: collegeProfile.logoUrl,
            city: collegeProfile.city,
          },
          recommendation: {
            score: rec.score,
            matchedSkills: rec.matchedSkills,
            unmatchedSkills: rec.unmatchedSkills,
            reasonScore: rec.reasonScore,
            urgencyScore: rec.urgencyScore,
            budgetScore: rec.budgetScore,
          },
          applicationsCount: (requirement as any)._count?.applications || 0,
          createdAt: requirement.createdAt,
        };
      })),
      expertSkillsForDisplay: expertSkills.map(skill => ({
        name: skill.name,
        level: skill.level,
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRequirements / limit),
        totalCount: totalRequirements,
        hasNextPage: page < Math.ceil(totalRequirements / limit),
        hasPrevPage: page > 1,
      },
      summary: {
        message: `${expertSkills.length} skills analyzed`,
        expertSkillCount: expertSkills.length,
        minScore,
        totalRecommendations: filteredRecommendations.length,
      },
    };
  }

  private async calculateRecommendationScore(
    requirement: any,
    expertSkills: Array<{ name: string; level: string }>,
  ): Promise<RecommendationScore> {
    const matchedSkills: SkillMatch[] = [];
    const unmatchedSkills: string[] = [];

    if (!requirement.requiredSkills) {
      return {
        requirementId: requirement.id,
        score: 0,
        matchedSkills,
        unmatchedSkills,
        skillScore: 0,
        reasonScore: 0,
        urgencyScore: 0,
        budgetScore: 0,
      };
    }

    const requiredSkillsText = requirement.requiredSkills.toLowerCase();
    const requiredSkills = this.extractSkillsFromText(requiredSkillsText);
    
    console.log(`Required skills extracted: [${requiredSkills.join(', ')}]`);
    console.log(`Expert skills: [${expertSkills.map(s => s.name).join(', ')}]`);
    
    // Calculate skill matching percentage
    let matchedCount = 0;
    
    for (const reqSkill of requiredSkills) {
      const normalizedReqSkill = reqSkill.toLowerCase().trim();
      
      const match = expertSkills.find(expSkill => {
        const normalizedExpSkill = expSkill.name.toLowerCase().trim();
        
        // Direct match
        if (normalizedExpSkill === normalizedReqSkill) {
          return true;
        }
        
        // Contains match (either direction)
        if (normalizedExpSkill.includes(normalizedReqSkill) || normalizedReqSkill.includes(normalizedExpSkill)) {
          return true;
        }
        
        // Handle plural/singular variations
        const reqSingular = normalizedReqSkill.replace(/s$/, '');
        const expSingular = normalizedExpSkill.replace(/s$/, '');
        if (reqSingular === expSingular && reqSingular.length > 2) {
          return true;
        }
        
        // Handle specific skill variations
        const skillVariations: { [key: string]: string[] } = {
          'data structure': ['data structures', 'ds', 'algorithms'],
          'data structures': ['data structure', 'ds', 'algorithms'],
          'sql': ['database', 'mysql', 'postgresql'],
          'java': ['java programming', 'core java'],
          'python': ['python programming', 'py'],
          'javascript': ['js', 'nodejs', 'node.js'],
        };
        
        const variations = skillVariations[normalizedReqSkill] || [];
        return variations.some(variation => 
          normalizedExpSkill.includes(variation) || variation.includes(normalizedExpSkill)
        );
      });
      
      if (match) {
        console.log(`✅ MATCH: "${reqSkill}" matches expert skill "${match.name}"`);
        matchedSkills.push({
          skill: reqSkill,
          matched: true,
          level: match.level as 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT',
        });
        matchedCount++;
      } else {
        console.log(`❌ NO MATCH: "${reqSkill}" not found in expert skills`);
        unmatchedSkills.push(reqSkill);
      }
    }

    // Calculate percentage based purely on skill matching
    const skillMatchPercentage = Math.round((matchedCount / requiredSkills.length) * 100);
    
    // Bonus points for skill levels (Expert = +10%, Intermediate = +5%, Beginner = +0%)
    let skillLevelBonus = 0;
    matchedSkills.forEach(matchedSkill => {
      switch (matchedSkill.level) {
        case 'EXPERT':
          skillLevelBonus += 10;
          break;
        case 'INTERMEDIATE':
          skillLevelBonus += 5;
          break;
        default:
          skillLevelBonus += 0;
          break;
      }
    });

    // Final score is skill match percentage + level bonuses (capped at 100)
    const totalScore = Math.min(100, skillMatchPercentage + skillLevelBonus);

    return {
      requirementId: requirement.id,
      score: totalScore,
      matchedSkills,
      unmatchedSkills,
      skillScore: totalScore,
      reasonScore: 0, // No longer used
      urgencyScore: 0, // No longer used
      budgetScore: 0, // No longer used
    };
  }

  private extractSkillsFromText(text: string): string[] {
    // First try to extract comma-separated values (most common format)
    const commaSeparated = text.split(',').map(s => s.trim().toLowerCase()).filter(s => s.length > 2);
    if (commaSeparated.length > 0) {
      return commaSeparated.slice(0, 10); // Limit to 10 skills
    }

    // Fallback to predefined keywords if no comma-separated values found
    const skillKeywords = [
      'javascript', 'python', 'java', 'react', 'nodejs', 'sql', 'mongodb', 
      'aws', 'docker', 'kubernetes', 'machine learning', 'ai', 'data science',
      'web development', 'mobile development', 'backend', 'frontend', 
      'full stack', 'database', 'cloud', 'security', 'testing', 'devops',
      'api', 'ui', 'ux', 'design', 'analytics', 'blockchain', 'ios', 'android',
      'data structure', 'data structures', 'algorithms', 'algorithm'
    ];

    const foundSkills: string[] = [];
    for (const keyword of skillKeywords) {
      if (text.includes(keyword)) {
        foundSkills.push(keyword);
      }
    }

    return foundSkills;
  }


  async getRecommendationStats(userId: string) {
    const expertProfile = await this.prisma.expertprofile.findUnique({
      where: { userId },
      include: {
        expertskill: true,
      },
    });

    if (!expertProfile) {
      throw new NotFoundException('Expert profile not found');
    }

    const totalRequirements = await this.prisma.requirement.count({
      where: {
        isActive: true,
      },
    });

    const appliedRequirements = await this.prisma.application.count({
      where: {
        expertId: userId,
      },
    });

    return {
      totalOpportunities: totalRequirements,
      appliedCount: appliedRequirements,
      skillsCount: expertProfile.expertskill.length,
      profileComplete: expertProfile.isProfileComplete,
      recommendationEligibility: {
        hasSkills: expertProfile.expertskill.length > 0,
        profileComplete: expertProfile.isProfileComplete,
        message: expertProfile.expertskill.length === 0 
          ? 'Add skills to get personalized recommendations'
          : 'You\'rement set for recommendations!',
      },
    };
  }

  // College recommendations - find experts matching college requirements
  async getCollegeRecommendations(
    collegeId: string,
    page: number = 1,
    limit: number = 10,
    minScore: number = 10,
  ) {
    // Get college profile and their requirements
    const collegeProfile = await this.prisma.collegeprofile.findUnique({
      where: { id: collegeId },
      include: {
        requirement: {
          where: { isActive: true },
          include: {
            _count: {
              select: {
                applications: true,
              },
            },
          },
        },
      },
    });

    if (!collegeProfile) {
      throw new NotFoundException('College profile not found');
    }

    if (!collegeProfile.requirement || collegeProfile.requirement.length === 0) {
      return {
        requirements: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
        summary: {
          message: 'Create requirements to see expert recommendations',
          totalRequirements: 0,
        },
      };
    }

    // Get all experts with their skills
    const experts = await this.prisma.expertprofile.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        expertskill: {
          select: {
            skillName: true,
            skillLevel: true,
          },
        },
      },
    });

    console.log(`Found ${experts.length} experts for matching`);
    console.log(`Experts with skills: ${experts.filter(e => e.expertskill.length > 0).length}`);

    // Calculate recommendations for each requirement
    const requirementsWithRecommendations = await Promise.all(
      collegeProfile.requirement.map(async (requirement) => {
        console.log(`\nProcessing requirement: ${requirement.title}`);
        console.log(`Required skills: ${requirement.requiredSkills}`);
        
        const expertRecommendations = await this.calculateExpertMatches(requirement, experts);
        console.log(`Total expert recommendations: ${expertRecommendations.length}`);
        console.log(`Scores: ${expertRecommendations.map(r => r.recommendation.score).join(', ')}`);
        
        // Filter by minimum score and sort by score
        const filteredExperts = expertRecommendations
          .filter(rec => rec.recommendation.score >= minScore)
          .sort((a, b) => b.recommendation.score - a.recommendation.score);

        console.log(`Filtered experts (minScore ${minScore}): ${filteredExperts.length}`);

        return {
          requirement: {
            id: requirement.id,
            title: requirement.title,
            description: requirement.description,
            category: requirement.category,
            subcategory: requirement.subcategory,
            requiredSkills: requirement.requiredSkills,
            budget: requirement.budget ? requirement.budget.toNumber() : null,
            budgetType: requirement.budgetType,
            deadline: requirement.deadline,
            isUrgent: requirement.isUrgent,
            experience: requirement.experience,
            applicationsCount: (requirement as any)._count?.applications || 0,
            createdAt: requirement.createdAt,
          },
          matchedExperts: filteredExperts,
          totalMatches: filteredExperts.length,
        };
      })
    );

    // Pagination
    const skip = (page - 1) * limit;
    const paginatedRequirements = requirementsWithRecommendations.slice(skip, skip + limit);

    return {
      requirements: paginatedRequirements,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(requirementsWithRecommendations.length / limit),
        totalCount: requirementsWithRecommendations.length,
        hasNextPage: page < Math.ceil(requirementsWithRecommendations.length / limit),
        hasPrevPage: page > 1,
      },
      summary: {
        message: `${requirementsWithRecommendations.length} requirements analyzed`,
        totalRequirements: requirementsWithRecommendations.length,
        minScore,
      },
    };
  }

  private async calculateExpertMatches(requirement: any, experts: any[]): Promise<Array<{
    expert: {
      id: string;
      name: string;
      email: string;
      profileImage: string | null;
      skills: Array<{ name: string; level: string }>;
    };
    recommendation: {
      score: number;
      matchedSkills: SkillMatch[];
      unmatchedSkills: string[];
    };
  }>> {
    const expertRecommendations: Array<{
      expert: {
        id: string;
        name: string;
        email: string;
        profileImage: string | null;
        skills: Array<{ name: string; level: string }>;
      };
      recommendation: {
        score: number;
        matchedSkills: SkillMatch[];
        unmatchedSkills: string[];
      };
    }> = [];

    console.log(`\nMatching against ${experts.length} experts`);

    for (const expert of experts) {
      const expertSkills = expert.expertskill.map(skill => ({
        name: skill.skillName.toLowerCase(),
        level: skill.skillLevel,
      }));

      if (expertSkills.length === 0) {
        console.log(`Expert ${expert.user.fullName} has no skills, skipping`);
        continue;
      }

      const matchResult = await this.calculateRecommendationScore(requirement, expertSkills);
      
      console.log(`Expert ${expert.user.fullName}: score ${matchResult.score}, matched skills: ${matchResult.matchedSkills.length}`);
      
      expertRecommendations.push({
        expert: {
          id: expert.user.id,
          name: expert.user.fullName,
          email: expert.user.email,
          profileImage: expert.profilePicture,
          skills: expertSkills,
        },
        recommendation: {
          score: matchResult.score,
          matchedSkills: matchResult.matchedSkills,
          unmatchedSkills: matchResult.unmatchedSkills,
        },
      });
    }

    return expertRecommendations;
  }
}
