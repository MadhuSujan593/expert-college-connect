import { 
  Controller, 
  Get, 
  Put, 
  Delete, 
  Param, 
  Query, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Get user's notifications
  @Get()
  async getUserNotifications(
    @Query() query: GetNotificationsDto,
    @Request() req
  ) {
    const result = await this.notificationService.getUserNotifications(
      req.user.id,
      query
    );
    return {
      success: true,
      data: result
    };
  }

  // Get unread notification count
  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.notificationService.getUnreadCount(req.user.id);
    return {
      success: true,
      data: { unreadCount: count }
    };
  }

  // Mark notification as read
  @Put(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Param('id') id: string,
    @Request() req
  ) {
    const notification = await this.notificationService.markAsRead(id, req.user.id);
    return {
      success: true,
      message: 'Notification marked as read',
      data: notification
    };
  }

  // Mark all notifications as read
  @Put('mark-all-read')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Request() req) {
    await this.notificationService.markAllAsRead(req.user.id);
    return {
      success: true,
      message: 'All notifications marked as read'
    };
  }

  // Delete notification
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteNotification(
    @Param('id') id: string,
    @Request() req
  ) {
    await this.notificationService.deleteNotification(id, req.user.id);
    return {
      success: true,
      message: 'Notification deleted successfully'
    };
  }
}
