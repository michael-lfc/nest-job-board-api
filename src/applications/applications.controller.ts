import { Controller, Get, Post, Param, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Applications')
@Controller()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @ApiOperation({ summary: 'Apply for a job with CV upload' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @Post('jobs/:jobId/apply')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('CANDIDATE')
  @UseInterceptors(FileInterceptor('cv', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `cv-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed'), false);
      }
    },
  }))
  apply(
    @GetUser('id') userId: number,
    @Param('jobId', ParseIntPipe) jobId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.applicationsService.apply(userId, jobId, file.path);
  }

  @ApiOperation({ summary: 'Get all applications for a job (Company only)' })
  @ApiBearerAuth()
  @Get('jobs/:jobId/applications')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('COMPANY', 'ADMIN')
  getJobApplications(
    @GetUser('id') userId: number,
    @Param('jobId', ParseIntPipe) jobId: number,
  ) {
    return this.applicationsService.getJobApplications(userId, jobId);
  }

  @ApiOperation({ summary: 'Get my applications (Candidate only)' })
  @ApiBearerAuth()
  @Get('applications/me')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('CANDIDATE')
  getMyApplications(@GetUser('id') userId: number) {
    return this.applicationsService.getMyApplications(userId);
  }
}