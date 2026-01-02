import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, Matches } from 'class-validator';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class CreateOwnerDto {
  @ApiProperty({ example: 'Abebe Kebede' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @NoHtml({ message: 'full_name must not include HTML or script tags' })
  full_name!: string;

  @ApiProperty({ example: '+251912345678' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(13)
  @NoHtml({ message: 'phone_number must not include HTML or script tags' })
  @Matches(/^\+2519\d{8}$/u, { message: 'phone_number must be in +2519XXXXXXXX format' })
  phone_number!: string;
}
