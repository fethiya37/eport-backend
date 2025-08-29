import { ApiProperty } from '@nestjs/swagger';

export class DriverResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() user_id!: number;
  @ApiProperty() association_id!: number;
  @ApiProperty() full_name!: string;
  @ApiProperty({ nullable: true }) license_no!: string | null;
  @ApiProperty({ nullable: true }) license_expiry!: Date | null;
  @ApiProperty() phone_number!: string;
  @ApiProperty({ enum: ['AVAILABLE','ON_TRIP','OFFLINE','SUSPENDED'] })
  status!: 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE' | 'SUSPENDED';
  @ApiProperty() created_at!: Date;
  @ApiProperty() updated_at!: Date;
}
