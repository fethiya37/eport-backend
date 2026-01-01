import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  Min,
} from 'class-validator';
import { VehicleStatus } from '@prisma/client';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class UpdateVehicleDto {
  @ApiPropertyOptional({ example: 'ABC-54321' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @NoHtml({ message: 'plate_number must not include HTML or script tags' })
  @Matches(/^[A-Za-z0-9-]+$/u, { message: 'plate_number contains invalid characters' })
  plate_number?: string | null;

  @ApiPropertyOptional({ example: 'LIBRE-1122' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @NoHtml({ message: 'libre_no must not include HTML or script tags' })
  @Matches(/^[A-Za-z0-9-]+$/u, { message: 'libre_no contains invalid characters' })
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
  @NoHtml({ message: 'make must not include HTML or script tags' })
  make?: string | null;

  @ApiPropertyOptional({ example: 'i10' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @NoHtml({ message: 'model must not include HTML or script tags' })
  model?: string | null;

  @ApiPropertyOptional({ example: 'Black' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @NoHtml({ message: 'color must not include HTML or script tags' })
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
