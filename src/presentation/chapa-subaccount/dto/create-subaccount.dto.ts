import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsIn,
  IsNumber,
  IsInt,
  MaxLength,
  Matches,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class CreateSubaccountDto {
  @ApiProperty({ example: 1, description: 'Chapa bank code as a number' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  bank_code!: number;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @NoHtml({ message: 'account_number must not include HTML or script tags' })
  @Matches(/^[0-9]+$/u, { message: 'account_number must contain digits only' })
  account_number!: string;

  @ApiProperty({ example: 'Abebe Kebede' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @NoHtml({ message: 'account_name must not include HTML or script tags' })
  account_name!: string;

  @ApiProperty({ example: 'Addis Taxi Association' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @NoHtml({ message: 'business_name must not include HTML or script tags' })
  business_name!: string;

  @ApiProperty({ enum: ['fixed', 'percentage'], default: 'percentage', required: false })
  @IsOptional()
  @IsIn(['fixed', 'percentage'])
  split_type?: 'fixed' | 'percentage' = 'percentage';

  @ApiProperty({ example: 1, description: 'Use 1 to send 100% to association', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(1)
  split_value?: number = 1;
}
