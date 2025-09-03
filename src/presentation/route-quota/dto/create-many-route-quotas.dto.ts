import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsInt, Min, IsString, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class QuotaItemDto {
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1) route_id!: number;
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1) no_vehicles!: number;
}

export class CreateManyRouteQuotasDto {
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1) association_id!: number;

  @ApiProperty({ example: '2017-01-01' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  start_date!: string;

  @ApiProperty({ example: '2017-01-07' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  end_date!: string;

  @ApiProperty({ type: [QuotaItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => QuotaItemDto)
  items!: QuotaItemDto[];
}
