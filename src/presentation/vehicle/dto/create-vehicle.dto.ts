import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
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
}
