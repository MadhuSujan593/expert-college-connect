import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Query, 
  Body, 
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { user_role } from '@prisma/client';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(user_role.SUPER_ADMIN)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  /**
   * Get dashboard statistics
   */
  @Get('dashboard')
  async getDashboardStats() {
    return this.superAdminService.getDashboardStats();
  }

  /**
   * Get system overview
   */
  @Get('overview')
  async getSystemOverview() {
    return this.superAdminService.getSystemOverview();
  }

  /**
   * Get all users with filtering and pagination
   */
  @Get('users')
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('role') role?: user_role,
    @Query('search') search?: string,
    @Query('isActive') isActive?: boolean
  ) {
    return this.superAdminService.getAllUsers(page, limit, role, search, isActive);
  }

  /**
   * Get user by ID with detailed information
   */
  @Get('users/:id')
  async getUserById(@Param('id') userId: string) {
    return this.superAdminService.getUserById(userId);
  }

  /**
   * Toggle user active status
   */
  @Put('users/:id/toggle-status')
  async toggleUserStatus(@Param('id') userId: string) {
    return this.superAdminService.toggleUserStatus(userId);
  }

  /**
   * Delete user (soft delete)
   */
  @Delete('users/:id')
  async deleteUser(@Param('id') userId: string) {
    return this.superAdminService.deleteUser(userId);
  }

  /**
   * Restore deleted user (undo soft delete)
   */
  @Put('users/:id/restore')
  async restoreUser(@Param('id') userId: string) {
    return this.superAdminService.restoreUser(userId);
  }

  /**
   * Get user activity logs
   */
  @Get('users/:id/activity')
  async getUserActivity(
    @Param('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number
  ) {
    return this.superAdminService.getUserActivity(userId, page, limit);
  }

  /**
   * Get user statistics by role
   */
  @Get('stats/users-by-role')
  async getUsersByRole() {
    const [collegeAdmins, experts, regularUsers] = await Promise.all([
      this.superAdminService.getAllUsers(1, 1000, user_role.COLLEGE_ADMIN),
      this.superAdminService.getAllUsers(1, 1000, user_role.EXPERT),
      this.superAdminService.getAllUsers(1, 1000, user_role.USER)
    ]);

    return {
      collegeAdmins: collegeAdmins.pagination.total,
      experts: experts.pagination.total,
      regularUsers: regularUsers.pagination.total
    };
  }

  /**
   * Get recent activity across the platform
   */
  @Get('recent-activity')
  async getRecentActivity() {
    const recentUsers = await this.superAdminService.getAllUsers(1, 5, undefined, undefined, true);

    return {
      recentUsers: recentUsers.users,
      // Add more recent activity data
    };
  }
}
