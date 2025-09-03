import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { GetApplicationsDto } from './dto/get-applications.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { user_role as UserRole } from '@prisma/client';

@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  // Expert applies for a requirement
  @Post()
  @Roles(UserRole.EXPERT)
  @HttpCode(HttpStatus.CREATED)
  async createApplication(
    @Body() createApplicationDto: CreateApplicationDto,
    @Request() req
  ) {
    const application = await this.applicationService.createApplication(
      createApplicationDto,
      req.user.id
    );
    return {
      success: true,
      message: 'Application submitted successfully',
      data: application
    };
  }

  // Get expert's applications
  @Get('my-applications')
  @Roles(UserRole.EXPERT)
  async getMyApplications(
    @Query() query: GetApplicationsDto,
    @Request() req
  ) {
    const result = await this.applicationService.getExpertApplications(
      req.user.id,
      query
    );
    return {
      success: true,
      data: result
    };
  }

  // Get all applications for a college admin across all requirements
  @Get('college')
  @Roles(UserRole.COLLEGE_ADMIN)
  async getCollegeApplications(
    @Query() query: GetApplicationsDto,
    @Request() req
  ) {
    const result = await this.applicationService.getCollegeApplications(
      req.user.id,
      query
    );
    return {
      success: true,
      data: result
    };
  }

  // Get applications for a specific requirement (college admin view)
  @Get('requirement/:requirementId')
  @Roles(UserRole.COLLEGE_ADMIN)
  async getRequirementApplications(
    @Param('requirementId') requirementId: string,
    @Query() query: GetApplicationsDto,
    @Request() req
  ) {
    const result = await this.applicationService.getRequirementApplications(
      requirementId,
      req.user.id,
      query
    );
    return {
      success: true,
      data: result
    };
  }

  // Get specific application details
  @Get(':id')
  async getApplication(
    @Param('id') id: string,
    @Request() req
  ) {
    const application = await this.applicationService.getApplicationById(
      id,
      req.user.id
    );
    return {
      success: true,
      data: application
    };
  }

  // Update application status (college admin action)
  @Put(':id/status')
  @Roles(UserRole.COLLEGE_ADMIN)
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateApplicationStatusDto,
    @Request() req
  ) {
    const application = await this.applicationService.updateApplicationStatus(
      id,
      updateDto,
      req.user.id
    );
    return {
      success: true,
      message: 'Application status updated successfully',
      data: application
    };
  }

  // Withdraw application (expert action)
  @Delete(':id')
  @Roles(UserRole.EXPERT)
  @HttpCode(HttpStatus.OK)
  async withdrawApplication(
    @Param('id') id: string,
    @Request() req
  ) {
    await this.applicationService.withdrawApplication(id, req.user.id);
    return {
      success: true,
      message: 'Application withdrawn successfully'
    };
  }
}
