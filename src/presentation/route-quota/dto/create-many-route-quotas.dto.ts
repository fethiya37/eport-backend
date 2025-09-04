import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested, IsInt, Min, IsString, Matches } from 'class-validator';

class CreateManyItem {
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1)
  route_id!: number;

  @ApiProperty() @Type(() => Number) @IsInt() @Min(1)
  no_vehicles!: number;
}

export class CreateManyRouteQuotasDto {
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1)
  association_id!: number;

  @ApiProperty({ example: '2017-01-08' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'start_date must be YYYY-MM-DD' })
  start_date!: string;

  @ApiProperty({ example: '2017-01-14' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'end_date must be YYYY-MM-DD' })
  end_date!: string;

  @ApiProperty({ type: [CreateManyItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateManyItem)
  items!: CreateManyItem[];
}
