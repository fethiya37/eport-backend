import { IsInt, IsOptional, IsString, IsEnum } from 'class-validator';
import { DriverStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class DriverFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  association_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @IsOptional()
  @IsString()
  license_no?: string;
}
