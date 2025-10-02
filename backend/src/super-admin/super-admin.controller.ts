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
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

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

  // ===== Plans Management =====
  @Get('plans')
  async listPlans() {
    return this.superAdminService.listPlans();
  }

  @Get('plans/active')
  async listActivePlans() {
    return this.superAdminService.listActivePlans();
  }

  @Post('plans')
  async createPlan(@Body() dto: CreatePlanDto) {
    return this.superAdminService.createPlan(dto);
  }

  @Put('plans/:id')
  async updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.superAdminService.updatePlan(id, dto);
  }

  @Put('plans/:id/toggle')
  async togglePlan(@Param('id') id: string) {
    return this.superAdminService.togglePlan(id);
  }

  @Delete('plans/:id')
  async deletePlan(@Param('id') id: string) {
    return this.superAdminService.deletePlan(id);
  }

  // ===== Subscriptions visibility =====
  @Get('subscriptions')
  async listSubscriptions(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('userId') userId?: string,
    @Query('planId') planId?: string,
    @Query('status') status?: string,
  ) {
    return this.superAdminService.listSubscriptions({ page, limit, userId, planId, status });
  }

  @Get('subscriptions/:id')
  async getSubscription(@Param('id') id: string) {
    return this.superAdminService.getSubscription(id);
  }

  @Post('subscriptions')
  async createSubscription(@Body() dto: CreateSubscriptionDto) {
    return this.superAdminService.createSubscription(dto);
  }

  @Put('subscriptions/:id/cancel')
  async cancelSubscription(@Param('id') id: string) {
    return this.superAdminService.cancelSubscription(id);
  }

  @Get('plans/:id/subscribers')
  async listPlanSubscribers(
    @Param('id') planId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.superAdminService.listPlanSubscribers(planId, page, limit);
  }

  @Get('invoices')
  async getInvoiceDetails(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('planId') planId?: string,
    @Query('search') search?: string,
    @Query('paymentStatus') paymentStatus?: string,
  ) {
    return this.superAdminService.getInvoiceDetails(page, limit, status, planId, search, paymentStatus);
  }
}
