import { ApiProperty } from '@nestjs/swagger';

export class AssociationResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() name!: string;
  @ApiProperty({ nullable: true }) phone_number!: string | null; // 👈
  @ApiProperty({ nullable: true }) logo!: string | null;
  @ApiProperty({ enum: ['ACTIVE','SUSPENDED'] }) status!: 'ACTIVE' | 'SUSPENDED';
  @ApiProperty() created_at!: Date;
  @ApiProperty() updated_at!: Date;
}
