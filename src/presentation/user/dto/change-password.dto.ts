import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldPass123' })
  @IsString() @IsNotEmpty()
  old_password!: string;

  @ApiProperty({ example: 'newPass123' })
  @IsString() @IsNotEmpty()
  new_password!: string;
}
