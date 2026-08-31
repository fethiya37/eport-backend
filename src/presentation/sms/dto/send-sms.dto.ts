import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, Matches } from 'class-validator';

export class SendSmsDto {
  @ApiProperty({ example: '+251912345678' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+251[79]\d{8}$/, {
    message: 'Invalid Ethiopian phone number format',
  })
  to!: string;

  @ApiProperty({ example: 'Your password is: TempPass123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160, { message: 'Message must not exceed 160 characters' })
  message!: string;
}
