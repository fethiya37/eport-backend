import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: '0911223344' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @MinLength(4)
  phone_number!: string;

  @ApiProperty({ example: 'StrongP@ssw0rd' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
