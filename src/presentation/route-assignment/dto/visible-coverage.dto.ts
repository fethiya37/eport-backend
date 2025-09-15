// src/presentation/route-assignment/dto/visible-coverage.dto.ts
import { IsString } from 'class-validator';

export class VisibleCoverageQueryDto {
  @IsString()
  plate_number!: string;
}
