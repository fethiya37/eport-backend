import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  old_password!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  new_password!: string;
}
