import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayMinSize, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ApproveAssignmentsDto {
  @ApiProperty({ type: [Number] })
  @IsArray() @ArrayMinSize(1)
  @Type(() => Number)
  ids!: number[];
}
