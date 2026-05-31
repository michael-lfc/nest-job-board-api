import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobType } from '@prisma/client';

export class CreateJobDto {
  @ApiProperty({ example: 'Backend Developer' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'We are looking for a backend developer...' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 'Lagos, Nigeria' })
  @IsString()
  @IsNotEmpty()
  location!: string;

  @ApiProperty({ enum: JobType, example: JobType.FULL_TIME })
  @IsEnum(JobType)
  type!: JobType;

  @ApiPropertyOptional({ example: '$1000 - $2000' })
  @IsString()
  @IsOptional()
  salary?: string;
}