import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AssignmentItemDto } from './assignment-item.dto';

export class BulkUpsertAssignmentsDto {
  @ApiProperty({ type: [AssignmentItemDto] })
  @ValidateNested({ each: true })
  @Type(() => AssignmentItemDto)
  items!: AssignmentItemDto[];

  // Admin/Superadmin may target another association; Associations ignored (taken from ctx)
  @ApiPropertyOptional({ example: 3 })
  @Type(() => Number)
  association_id?: number;
}
