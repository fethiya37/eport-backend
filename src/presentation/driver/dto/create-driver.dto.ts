import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDriverDto {
  @ApiProperty({ example: 'Abebe Kebede' })
  @IsString()
  @MaxLength(100)
  full_name!: string;

  @ApiProperty({ example: '+251911223344' })
  @IsString()
  @MaxLength(20)
  phone_number!: string;

  @ApiPropertyOptional({ example: 'D-123456' })
  @IsOptional()
  @IsString()
  license_no?: string | null;

  @ApiPropertyOptional({ example: '2030-12-31' })
  @IsOptional()
  @IsDateString()
  license_expiry?: string | null;

  // Plan: true = weekly, false = monthly (default false)
  @ApiPropertyOptional({ example: true, description: 'true=weekly, false=monthly (default monthly)' })
  @IsOptional()
  @IsBoolean()
  is_weekly?: boolean;

  // Vehicle to assign on creation (active assignment will be created)
  @ApiProperty({ example: 42 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  vehicle_id!: number;
}
