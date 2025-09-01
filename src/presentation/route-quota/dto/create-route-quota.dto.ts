import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRouteQuotaDto {
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1)
  association_id!: number;

  @ApiProperty() @Type(() => Number) @IsInt() @Min(1)
  route_id!: number;

  // Ethiopian calendar as 'YYYY-MM-DD' string; converter will handle calendar logic
  @ApiProperty({ example: '2017-01-01' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'start_date must be YYYY-MM-DD' })
  start_date!: string;

  @ApiProperty({ example: '2017-01-07' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'end_date must be YYYY-MM-DD' })
  end_date!: string;

  @ApiProperty() @Type(() => Number) @IsInt() @Min(1)
  no_vehicles!: number;
}
