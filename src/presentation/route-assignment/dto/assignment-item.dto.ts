import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AssignmentItemDto {
  @ApiPropertyOptional({ example: 10, description: 'If present, update this assignment; else create' })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) id?: number;

  @ApiProperty() @Type(() => Number) @IsInt() @Min(1) route_id!: number;
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1) driver_id!: number;
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1) vehicle_id!: number;

  // Ethiopian calendar strings
  @ApiProperty({ example: '2017-01-01' }) start_date!: string;
  @ApiProperty({ example: '2017-01-07' }) end_date!: string;

  @ApiProperty() @IsBoolean() is_weekly!: boolean;

  // Admin/Superadmin may pass 'Approved' directly; Associations ignored (forced Pending)
  @ApiPropertyOptional({ example: 'Approved' }) @IsOptional() status?: 'Approved' | 'Pending';
}
