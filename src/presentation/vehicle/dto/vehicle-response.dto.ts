import { ApiProperty } from '@nestjs/swagger';

export class VehicleResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() plate_number!: string;
  @ApiProperty({ nullable: true }) libre_no!: string | null;
  @ApiProperty() owner_id!: number;
  @ApiProperty() association_id!: number;
  @ApiProperty({ nullable: true }) make!: string | null;
  @ApiProperty({ nullable: true }) model!: string | null;
  @ApiProperty({ nullable: true }) color!: string | null;
  @ApiProperty({ nullable: true }) capacity!: number | null;
  @ApiProperty({ enum: ['ACTIVE','MAINTENANCE','RETIRED','SUSPENDED','RESIGNED'] })
  status!: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED' | 'SUSPENDED' | 'RESIGNED';
  @ApiProperty() started_at!: Date;                 // NEW
  @ApiProperty({ nullable: true }) ended_at!: Date | null; // NEW
  @ApiProperty() created_at!: Date;
  @ApiProperty() updated_at!: Date;
}
