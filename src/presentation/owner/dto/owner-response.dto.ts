import { ApiProperty } from '@nestjs/swagger';

export class OwnerResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() user_id!: number;
  @ApiProperty() association_id!: number;
  @ApiProperty() full_name!: string;
  @ApiProperty() phone_number!: string;
  @ApiProperty({ enum: ['ACTIVE','SUSPENDED'] }) status!: 'ACTIVE' | 'SUSPENDED';
  @ApiProperty() created_at!: Date;
  @ApiProperty() updated_at!: Date;
}
