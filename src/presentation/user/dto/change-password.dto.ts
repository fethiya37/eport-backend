import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class ChangePasswordDto {
  @ApiProperty({ writeOnly: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(128)
  @NoHtml({ message: 'old_password must not include HTML or script tags' })
  old_password!: string;

  @ApiProperty({ writeOnly: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(128)
  @NoHtml({ message: 'new_password must not include HTML or script tags' })
  new_password!: string;
}
