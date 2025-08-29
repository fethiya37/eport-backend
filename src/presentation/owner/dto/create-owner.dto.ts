import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateOwnerDto {
  @ApiProperty({ example: 'Abebe Kebede' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  full_name!: string;

  @ApiProperty({ example: '0911223344' })
  @IsString() @IsNotEmpty() @MaxLength(20)
  phone_number!: string;
}
