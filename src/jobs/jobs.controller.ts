import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { FilterJobDto } from './dto/filter-job.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @ApiOperation({ summary: 'Get all jobs with filters and pagination' })
  @Get()
  findAll(@Query() filters: FilterJobDto) {
    return this.jobsService.findAll(filters);
  }

  @ApiOperation({ summary: 'Get a single job' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.findOne(id);
  }

  @ApiOperation({ summary: 'Post a new job (Company only)' })
  @ApiBearerAuth()
  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('COMPANY', 'ADMIN')
  create(
    @GetUser('id') userId: number,
    @Body() dto: CreateJobDto,
  ) {
    return this.jobsService.create(userId, dto);
  }

  @ApiOperation({ summary: 'Update own job (Company only)' })
  @ApiBearerAuth()
  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('COMPANY', 'ADMIN')
  update(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobsService.update(userId, id, dto);
  }

  @ApiOperation({ summary: 'Delete own job (Company only)' })
  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('COMPANY', 'ADMIN')
  remove(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.jobsService.remove(userId, id);
  }
}
