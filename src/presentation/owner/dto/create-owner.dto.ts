import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateOwnerDto {
  @ApiProperty({ example: 'Abebe Kebede' })
  @IsString()
  @MaxLength(100)
  full_name!: string;

  @ApiProperty({ example: '+251911223344' })
  @IsString()
  @MaxLength(20)
  phone_number!: string;
}
