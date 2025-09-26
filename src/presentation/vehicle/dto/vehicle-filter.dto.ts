import { IsInt, IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { VehicleStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class VehicleFilterDto {
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
  plate_number?: string;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  owner_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  driver_id?: number;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  is_weekly?: boolean;
}
