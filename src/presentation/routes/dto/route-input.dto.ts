import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RouteInputDto {
  @ApiPropertyOptional({ example: 12, description: 'If provided, this route will be updated; otherwise created' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id?: number;

  @ApiProperty({ example: 'Addis Ababa' })
  @IsString()
  @MaxLength(255)
  departure!: string;

  @ApiProperty({ example: 'Adama' })
  @IsString()
  @MaxLength(255)
  arrival!: string;

  // Nullable in DB; optional in payload
  @ApiPropertyOptional({ example: '99.50', description: 'numeric(6,2) — string or number' })
  @IsOptional()
  kilometer?: string | number | null;

  @ApiPropertyOptional({ example: '150.00', description: 'numeric(6,2) — string or number' })
  @IsOptional()
  tariff?: string | number | null;
}
