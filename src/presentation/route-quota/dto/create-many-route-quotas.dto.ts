import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

class CreateManyItem {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  route_id!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  no_vehicles!: number;
}

export class CreateManyRouteQuotasDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  association_id!: number;

  @ApiProperty({ example: '2017-01-08' })
  @IsString()
  @MaxLength(10)
  @NoHtml({ message: 'start_date must not include HTML or script tags' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/u, { message: 'start_date must be YYYY-MM-DD' })
  start_date!: string;

  @ApiProperty({ example: '2017-01-14' })
  @IsString()
  @MaxLength(10)
  @NoHtml({ message: 'end_date must not include HTML or script tags' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/u, { message: 'end_date must be YYYY-MM-DD' })
  end_date!: string;

  @ApiProperty({ type: [CreateManyItem] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateManyItem)
  items!: CreateManyItem[];
}
