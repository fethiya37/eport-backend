import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { DriverStatus } from '@prisma/client';
import { Type } from 'class-transformer';

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

  // Allow plan toggle; we’ll enforce “only when no active coverage” in service
  @ApiPropertyOptional({ example: true, description: 'true=weekly, false=monthly' })
  @IsOptional()
  @IsBoolean()
  is_weekly?: boolean;

  // If provided and different from the active one, will reassign
  @ApiPropertyOptional({ example: 77 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  vehicle_id?: number;

  // Needed on update. If set to SUSPENDED, the active assignment will be closed.
  @ApiPropertyOptional({ enum: DriverStatus, example: 'SUSPENDED' })
  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;
}
