import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength, IsBoolean } from 'class-validator';
import { DriverStatus } from '@prisma/client';

export class UpdateDriverDto {
  @ApiPropertyOptional({ example: 'New Name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  full_name?: string;

  @ApiPropertyOptional({ example: '+251922233344' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone_number?: string;

  @ApiPropertyOptional({ example: 'D-654321' })
  @IsOptional()
  @IsString()
  license_no?: string | null;

  @ApiPropertyOptional({ example: '2031-01-01' })
  @IsOptional()
  @IsDateString()
  license_expiry?: string | null;

  @ApiPropertyOptional({ enum: DriverStatus, example: 'INACTIVE' })
  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  has_smartphone?: boolean;   // ✅ new
}
