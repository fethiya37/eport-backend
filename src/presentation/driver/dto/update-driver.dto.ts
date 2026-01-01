import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  IsNumber,
  Min,
} from 'class-validator';
import { DriverStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class UpdateDriverDto {
  @ApiPropertyOptional({ example: 'New Name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @NoHtml({ message: 'full_name must not include HTML or script tags' })
  full_name?: string;

  @ApiPropertyOptional({ example: '+251912345678' })
  @IsOptional()
  @IsString()
  @MaxLength(13)
  @NoHtml({ message: 'phone_number must not include HTML or script tags' })
  @Matches(/^\+2519\d{8}$/u, { message: 'phone_number must be in +2519XXXXXXXX format' })
  phone_number?: string;

  @ApiPropertyOptional({ example: 'D-654321' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @NoHtml({ message: 'license_no must not include HTML or script tags' })
  @Matches(/^[A-Za-z0-9-]+$/u, { message: 'license_no contains invalid characters' })
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
  has_smartphone?: boolean;

  @ApiPropertyOptional({ example: '2032-06-30', description: 'Active/paid through (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  active_until_date?: string | null;

  @ApiPropertyOptional({ example: 125.5, description: 'Total interest accrued (Decimal(10,2))' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  interest_accrued?: number;
}
