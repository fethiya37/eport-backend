import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class RouteInputDto {
  @ApiPropertyOptional({ example: 12, description: 'If provided, this route will be updated; otherwise created' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id?: number;

  @ApiProperty({ example: 'Addis Ababa' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @NoHtml({ message: 'departure must not include HTML or script tags' })
  departure!: string;

  @ApiProperty({ example: 'Adama' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @NoHtml({ message: 'arrival must not include HTML or script tags' })
  arrival!: string;

  @ApiPropertyOptional({ example: '99.50', description: 'numeric(6,2) — string or number' })
  @IsOptional()
  @Matches(/^\d{1,4}(\.\d{1,2})?$/u, { message: 'kilometer must be a valid decimal (up to 2 dp)' })
  kilometer?: string | number | null;

  @ApiPropertyOptional({ example: '150.00', description: 'numeric(6,2) — string or number' })
  @IsOptional()
  @Matches(/^\d{1,4}(\.\d{1,2})?$/u, { message: 'tariff must be a valid decimal (up to 2 dp)' })
  tariff?: string | number | null;
}
