import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpsertPolicyDto {
  @ApiProperty({ example: 200 })
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  weekly_fee!: number;

  @ApiProperty({ example: 600 })
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  monthly_fee!: number;

  @ApiProperty({
    example: 0.2,
    description: 'Daily fine percent. 0.2 = 20% per day',
  })
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  daily_fine_percent!: number;
}
