import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class ChangePasswordDto {
  @ApiProperty({ writeOnly: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(64)
  @NoHtml({ message: 'old_password must not include HTML or script tags' })
  old_password!: string;

  @ApiProperty({ writeOnly: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,64}$/, {
    message:
      'new_password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol',
  })
  @NoHtml({ message: 'new_password must not include HTML or script tags' })
  new_password!: string;
}
