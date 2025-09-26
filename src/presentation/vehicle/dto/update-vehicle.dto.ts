import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { VehicleStatus } from '@prisma/client';

export class UpdateVehicleDto {
  @ApiPropertyOptional({ example: 'ABC-54321' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  plate_number?: string | null;

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

  @ApiPropertyOptional({ example: 22, description: 'Driver ID assigned to this vehicle' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  driver_id?: number | null;

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

  @ApiPropertyOptional({ enum: VehicleStatus, example: 'MAINTENANCE' })
  @IsOptional()
  @IsEnum(VehicleStatus)
  vehicle_status?: VehicleStatus;

  @ApiPropertyOptional({ example: true, description: 'Whether the vehicle is on a weekly plan' })
  @IsOptional()
  @IsBoolean()
  is_weekly?: boolean;
}
