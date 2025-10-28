import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsIn, IsNumber, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubaccountDto {
  @ApiProperty({ example: 1, description: 'Chapa bank code as a number' })
  @Type(() => Number)
  @IsInt()
  bank_code!: number;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  @IsNotEmpty()
  account_number!: string;

  @ApiProperty({ example: 'Abebe Kebede' })
  @IsString()
  @IsNotEmpty()
  account_name!: string;

  @ApiProperty({ example: 'Addis Taxi Association' })
  @IsString()
  @IsNotEmpty()
  business_name!: string;

  @ApiProperty({ enum: ['fixed', 'percentage'], default: 'percentage', required: false })
  @IsOptional()
  @IsIn(['fixed', 'percentage'])
  split_type?: 'fixed' | 'percentage' = 'percentage';

  @ApiProperty({ example: 1, description: 'Use 1 to send 100% to association' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  split_value?: number = 1;
}
