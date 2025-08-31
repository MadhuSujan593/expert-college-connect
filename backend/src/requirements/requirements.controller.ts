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
import { GetRequirementsDto } from './dto/get-requirements.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('requirements')
@UseGuards(JwtAuthGuard)
export class RequirementsController {
  constructor(private readonly requirementsService: RequirementsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRequirementDto: CreateRequirementDto, @Request() req) {
    return this.requirementsService.create(createRequirementDto, req.user.id);
  }

  @Get()
  findAll(@Query() query: any, @Request() req) {
    return this.requirementsService.findAll(query, req.user.id, false); // Show ALL requirements (for experts)
  }

  @Get('college')
  findAllForCollege(@Query() query: any, @Request() req) {
    return this.requirementsService.findAll(query, req.user.id, true); // Filter by college for college users
  }

  @Get('categories')
  getCategories() {
    return this.requirementsService.getCategories();
  }

  @Get('recent')
  findRecent(@Request() req) {
    return this.requirementsService.getRecentRequirements(req.user.id, 5);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requirementsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRequirementDto: UpdateRequirementDto,
    @Request() req,
  ) {
    return this.requirementsService.update(id, updateRequirementDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req) {
    return this.requirementsService.remove(id, req.user.id);
  }
}
