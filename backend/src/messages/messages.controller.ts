import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  Request,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { user_role as UserRole } from '@prisma/client';

@Controller('messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // Get messages for a specific application
  @Get('application/:applicationId')
  @Roles(UserRole.EXPERT, UserRole.COLLEGE_ADMIN)
  async getApplicationMessages(
    @Param('applicationId') applicationId: string,
    @Request() req
  ) {
    const messages = await this.messagesService.getApplicationMessages(
      applicationId,
      req.user.id
    );
    return {
      success: true,
      data: { messages }
    };
  }

  // Send a message for a specific application
  @Post('application/:applicationId')
  @Roles(UserRole.EXPERT, UserRole.COLLEGE_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async sendApplicationMessage(
    @Param('applicationId') applicationId: string,
    @Body() createMessageDto: CreateMessageDto,
    @Request() req
  ) {
    const message = await this.messagesService.sendApplicationMessage(
      applicationId,
      createMessageDto,
      req.user.id
    );
    return {
      success: true,
      message: 'Message sent successfully',
      data: message
    };
  }
}
