import { IsInt, IsOptional, IsString, IsEnum, IsBoolean, MaxLength, Matches } from 'class-validator';
import { DriverStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class DriverFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  association_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @NoHtml({ message: 'full_name must not include HTML or script tags' })
  full_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(13)
  @NoHtml({ message: 'phone_number must not include HTML or script tags' })
  @Matches(/^\+2519\d{8}$/u, { message: 'phone_number must be in +2519XXXXXXXX format' })
  phone_number?: string;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @NoHtml({ message: 'license_no must not include HTML or script tags' })
  license_no?: string;

  @IsOptional()
  @IsBoolean()
  has_smartphone?: boolean;
}
