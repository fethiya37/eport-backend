import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class VisibleCoverageQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @NoHtml({ message: 'plate_number must not include HTML or script tags' })
  @Matches(/^[A-Za-z0-9-]+$/u, { message: 'plate_number contains invalid characters' })
  plate_number?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  driver_id?: number;
}
