import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { VehicleStatus, VehicleAssociationStatus } from '@prisma/client';

export class UpdateVehicleDto {
  @ApiPropertyOptional({ example: 'LIBRE-1122' })
  @IsOptional()
  @IsString()
  libre_no?: string | null;

  @ApiPropertyOptional({ example: 11 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  owner_id?: number;

  @ApiPropertyOptional({ example: 'Hyundai' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  make?: string | null;

  @ApiPropertyOptional({ example: 'i10' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  model?: string | null;

  @ApiPropertyOptional({ example: 'Black' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  color?: string | null;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number | null;

  // VEHICLE status (matches VehicleStatus in Prisma: ACTIVE | MAINTENANCE | RETIRED)
  @ApiPropertyOptional({ enum: VehicleStatus, example: 'MAINTENANCE' })
  @IsOptional()
  @IsEnum(VehicleStatus)
  vehicle_status?: VehicleStatus;

  // ASSOCIATION status (history table): ACTIVE | SUSPENDED | RESIGNED
  @ApiPropertyOptional({ enum: VehicleAssociationStatus, example: 'SUSPENDED' })
  @IsOptional()
  @IsEnum(VehicleAssociationStatus)
  association_status?: VehicleAssociationStatus;
}
