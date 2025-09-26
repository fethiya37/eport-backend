import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVehicleDto {
  @ApiProperty({ example: 'ABC-12345' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  plate_number!: string;

  @ApiPropertyOptional({ example: 'LIBRE-0099' })
  @IsOptional()
  @IsString()
  libre_no?: string | null;

  @ApiProperty({ example: 10, description: 'Owner ID in your association' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  owner_id!: number;

  @ApiPropertyOptional({ example: 22, description: 'Driver ID assigned to this vehicle' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  driver_id?: number | null;

  @ApiPropertyOptional({ example: 'Toyota' })
  @IsOptional()
  @IsString()
  make?: string | null;

  @ApiPropertyOptional({ example: 'Yaris' })
  @IsOptional()
  @IsString()
  model?: string | null;

  @ApiPropertyOptional({ example: 'White' })
  @IsOptional()
  @IsString()
  color?: string | null;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number | null;

  @ApiPropertyOptional({ example: true, description: 'Whether the vehicle is on a weekly plan' })
  @IsOptional()
  @IsBoolean()
  is_weekly?: boolean;
}
