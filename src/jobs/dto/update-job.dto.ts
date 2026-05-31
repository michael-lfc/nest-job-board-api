import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { JobType } from '@prisma/client';

export class UpdateJobDto {
  @ApiPropertyOptional({ example: 'Senior Backend Developer' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description...' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Abuja, Nigeria' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ enum: JobType })
  @IsEnum(JobType)
  @IsOptional()
  type?: JobType;

  @ApiPropertyOptional({ example: '$2000 - $3000' })
  @IsString()
  @IsOptional()
  salary?: string;
}