import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { RequirementsService } from './requirements.service';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { UpdateRequirementDto } from './dto/update-requirement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('requirements')
@UseGuards(JwtAuthGuard)
export class RequirementsController {
  constructor(private readonly requirementsService: RequirementsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRequirementDto: CreateRequirementDto, @Request() req) {
    console.log('🔍 [RequirementsController] POST /requirements called');
    console.log('🔍 [RequirementsController] CreateRequirementDto:', createRequirementDto);
    console.log('🔍 [RequirementsController] User from request:', req.user);
    
    try {
      const result = this.requirementsService.create(createRequirementDto, req.user.id);
      console.log('✅ [RequirementsController] Create call successful');
      return result;
    } catch (error) {
      console.error('❌ [RequirementsController] Error in create:', error);
      throw error;
    }
  }

  @Get()
  findAll(@Request() req, @Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    return this.requirementsService.findAll(req.user.id, pageNum, limitNum);
  }

  @Get('recent')
  findRecent(@Request() req) {
    return this.requirementsService.findRecentRequirements(req.user.id, 5);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.requirementsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRequirementDto: UpdateRequirementDto,
    @Request() req,
  ) {
    console.log('🔍 [RequirementsController] PATCH /requirements/:id called');
    console.log('🔍 [RequirementsController] ID from params:', id);
    console.log('🔍 [RequirementsController] UpdateRequirementDto:', updateRequirementDto);
    console.log('🔍 [RequirementsController] User from request:', req.user);
    console.log('🔍 [RequirementsController] User ID:', req.user?.id);
    
    try {
      const result = this.requirementsService.update(id, updateRequirementDto, req.user.id);
      console.log('✅ [RequirementsController] Update call successful');
      return result;
    } catch (error) {
      console.error('❌ [RequirementsController] Error in update:', error);
      console.error('❌ [RequirementsController] Error stack:', error.stack);
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req) {
    return this.requirementsService.remove(id, req.user.id);
  }
}
