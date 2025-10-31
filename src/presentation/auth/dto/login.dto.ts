import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UserType } from '@prisma/client';

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
  @MinLength(4)
  password!: string;

  @ApiPropertyOptional({ enum: UserType, description: 'Sent implicitly by client: Driver (mobile) or Association (web)' })
  @IsOptional()
  @IsEnum(UserType)
  as?: UserType;
}
