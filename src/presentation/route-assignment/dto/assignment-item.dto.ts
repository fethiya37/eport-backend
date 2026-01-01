import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  MaxLength,
} from 'class-validator';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class AssignmentItemDto {
  @ApiPropertyOptional({ example: 10, description: 'If present, update this assignment; else create' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id?: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  route_id!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  driver_id!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  vehicle_id!: number;

  @ApiProperty({ example: '2017-01-01' })
  @IsString()
  @MaxLength(10)
  @NoHtml({ message: 'start_date must not include HTML or script tags' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/u, { message: 'start_date must be YYYY-MM-DD' })
  start_date!: string;

  @ApiProperty({ example: '2017-01-07' })
  @IsString()
  @MaxLength(10)
  @NoHtml({ message: 'end_date must not include HTML or script tags' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/u, { message: 'end_date must be YYYY-MM-DD' })
  end_date!: string;

  @ApiProperty()
  @IsBoolean()
  is_weekly!: boolean;

  @ApiPropertyOptional({ example: 'Approved' })
  @IsOptional()
  @IsIn(['Approved', 'Pending'], { message: 'status must be Approved or Pending' })
  status?: 'Approved' | 'Pending';
}
