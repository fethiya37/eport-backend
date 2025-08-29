import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../infrastructure/auth/roles.guard';
import { AssociationContextGuard } from '../../infrastructure/auth/association-context.guard';
import { DriverService } from '../../application/services/driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriverResponseDto } from './dto/driver-response.dto';

@ApiTags('drivers')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, AssociationContextGuard)
@Controller('associations/:associationId/drivers')
export class DriverController {
  constructor(private readonly service: DriverService) {}

  @Post()
  @Roles('Superadmin', 'Admin', 'Association')
  @ApiOperation({ summary: 'Create driver (creates User and optional VehicleAssignment)' })
  @ApiResponse({ status: 201, type: DriverResponseDto })
  async create(@Req() req: any, @Body() dto: CreateDriverDto): Promise<DriverResponseDto> {
    const association_id = req.context.associationId as number;
    const d = await this.service.createDriver({
      association_id,
      full_name: dto.full_name,
      phone_number: dto.phone_number,
      license_no: dto.license_no ?? null,
      license_expiry: dto.license_expiry ? new Date(dto.license_expiry) : null,
      vehicle_id: dto.vehicle_id,
    });
    return {
      id: d.id,
      user_id: d.user_id,
      association_id: d.association_id,
      full_name: d.full_name,
      license_no: d.license_no,
      license_expiry: d.license_expiry ?? null,
      phone_number: d.phone_number,
      status: d.status,
      created_at: d.created_at!,
      updated_at: d.updated_at!,
    };
  }

  @Get()
  @Roles('Superadmin', 'Admin', 'Association')
  @ApiOperation({ summary: 'List drivers in this association' })
  @ApiResponse({ status: 200, type: DriverResponseDto, isArray: true })
  async list(
    @Req() req: any,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: 'AVAILABLE'|'ON_TRIP'|'OFFLINE'|'SUSPENDED',
    @Query('search') search?: string,
  ): Promise<DriverResponseDto[]> {
    const association_id = req.context.associationId as number;
    const data = await this.service.list({
      association_id,
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
      status,
      search,
    });
    return data.map((d) => ({
      id: d.id,
      user_id: d.user_id,
      association_id: d.association_id,
      full_name: d.full_name,
      license_no: d.license_no,
      license_expiry: d.license_expiry ?? null,
      phone_number: d.phone_number,
      status: d.status,
      created_at: d.created_at!,
      updated_at: d.updated_at!,
    }));
  }

  @Get(':id')
  @Roles('Superadmin', 'Admin', 'Association')
  @ApiOperation({ summary: 'Get a driver by id (scoped)' })
  @ApiResponse({ status: 200, type: DriverResponseDto })
  async findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number): Promise<DriverResponseDto> {
    const association_id = req.context.associationId as number;
    const d = await this.service.getByIdScoped(id, association_id);
    return {
      id: d.id,
      user_id: d.user_id,
      association_id: d.association_id,
      full_name: d.full_name,
      license_no: d.license_no,
      license_expiry: d.license_expiry ?? null,
      phone_number: d.phone_number,
      status: d.status,
      created_at: d.created_at!,
      updated_at: d.updated_at!,
    };
  }

  @Patch(':id')
  @Roles('Superadmin', 'Admin', 'Association')
  @ApiOperation({ summary: 'Update driver; pass vehicle_id for reassignment, null to end' })
  @ApiResponse({ status: 200, type: DriverResponseDto })
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDriverDto,
  ): Promise<DriverResponseDto> {
    const association_id = req.context.associationId as number;
    const driver = await this.service.updateDriver({
      id,
      association_id,
      full_name: dto.full_name,
      phone_number: dto.phone_number,
      license_no: dto.license_no,
      license_expiry: dto.license_expiry ? new Date(dto.license_expiry) : undefined,
      status: dto.status,
      vehicle_id: dto.hasOwnProperty('vehicle_id') ? (dto as any).vehicle_id : undefined,
    });

    return {
      id: driver.id,
      user_id: driver.user_id,
      association_id: driver.association_id,
      full_name: driver.full_name,
      license_no: driver.license_no,
      license_expiry: driver.license_expiry ?? null,
      phone_number: driver.phone_number,
      status: driver.status,
      created_at: driver.created_at!,
      updated_at: driver.updated_at!,
    };
  }

  @Delete(':id')
  @Roles('Superadmin', 'Admin', 'Association')
  @ApiOperation({ summary: 'Delete driver (locks user + ends active assignments)' })
  @ApiResponse({ status: 200, schema: { example: { status: 'ok' } } })
  async remove(@Req() req: any, @Param('id', ParseIntPipe) id: number): Promise<{ status: 'ok' }> {
    const association_id = req.context.associationId as number;
    await this.service.deleteDriver(id, association_id);
    return { status: 'ok' };
  }
}
