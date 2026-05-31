import { IsEmail, IsString, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'michael@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'Michael' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: Role, example: Role.CANDIDATE })
  @IsEnum(Role)
  role!: Role;
}