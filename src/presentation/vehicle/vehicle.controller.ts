import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../infrastructure/auth/roles.guard';
import { AssociationContextGuard } from '../../infrastructure/auth/association-context.guard';
import { VehicleService } from '../../application/services/vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleResponseDto } from './dto/vehicle-response.dto';

@ApiTags('vehicles')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, AssociationContextGuard)
@Controller('associations/:associationId/vehicles')
export class VehicleController {
  constructor(private readonly service: VehicleService) {}

  @Post()
  @Roles('Superadmin', 'Admin', 'Association')
  @ApiOperation({ summary: 'Create a vehicle in this association' })
  @ApiResponse({ status: 201, type: VehicleResponseDto })
  async create(@Req() req: any, @Body() dto: CreateVehicleDto): Promise<VehicleResponseDto> {
    const association_id = req.context.associationId as number;
    const v = await this.service.createVehicle({
      association_id,
      plate_number: dto.plate_number,
      libre_no: dto.libre_no ?? null,
      owner_id: dto.owner_id,
      make: dto.make ?? null,
      model: dto.model ?? null,
      color: dto.color ?? null,
      capacity: dto.capacity ?? null,
    });
    return {
      id: v.id,
      plate_number: v.plate_number,
      libre_no: v.libre_no,
      owner_id: v.owner_id,
      association_id: v.association_id,
      make: v.make,
      model: v.model,
      color: v.color,
      capacity: v.capacity,
      status: v.status,
      started_at: v.started_at,     // NEW
      ended_at: v.ended_at,         // NEW
      created_at: v.created_at!,
      updated_at: v.updated_at!,
    };
  }

  @Get()
  @Roles('Superadmin', 'Admin', 'Association')
  @ApiOperation({ summary: 'List vehicles in this association' })
  @ApiResponse({ status: 200, type: VehicleResponseDto, isArray: true })
  async list(
    @Req() req: any,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: 'ACTIVE'|'MAINTENANCE'|'RETIRED'|'SUSPENDED'|'RESIGNED',
    @Query('search') search?: string,
    @Query('include_deleted') include_deleted?: string,
  ): Promise<VehicleResponseDto[]> {
    const association_id = req.context.associationId as number;
    const data = await this.service.list({
      association_id,
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
      status,
      search,
      include_deleted: include_deleted === 'true',
    });
    return data.map((v) => ({
      id: v.id,
      plate_number: v.plate_number,
      libre_no: v.libre_no,
      owner_id: v.owner_id,
      association_id: v.association_id,
      make: v.make,
      model: v.model,
      color: v.color,
      capacity: v.capacity,
      status: v.status,
      started_at: v.started_at,     // NEW
      ended_at: v.ended_at,         // NEW
      created_at: v.created_at!,
      updated_at: v.updated_at!,
    }));
  }

  @Get(':id')
  @Roles('Superadmin', 'Admin', 'Association')
  @ApiOperation({ summary: 'Get a vehicle by id (scoped)' })
  @ApiResponse({ status: 200, type: VehicleResponseDto })
  async findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number): Promise<VehicleResponseDto> {
    const association_id = req.context.associationId as number;
    const v = await this.service.getByIdScoped(id, association_id);
    return {
      id: v.id,
      plate_number: v.plate_number,
      libre_no: v.libre_no,
      owner_id: v.owner_id,
      association_id: v.association_id,
      make: v.make,
      model: v.model,
      color: v.color,
      capacity: v.capacity,
      status: v.status,
      started_at: v.started_at,     // NEW
      ended_at: v.ended_at,         // NEW
      created_at: v.created_at!,
      updated_at: v.updated_at!,
    };
  }

  @Patch(':id')
  @Roles('Superadmin', 'Admin', 'Association')
  @ApiOperation({ summary: 'Update a vehicle; status changes update started/ended timestamps' })
  @ApiResponse({ status: 200, type: VehicleResponseDto })
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVehicleDto,
  ): Promise<VehicleResponseDto> {
    const association_id = req.context.associationId as number;
    const v = await this.service.updateVehicle({
      id,
      association_id,
      plate_number: dto.plate_number,
      libre_no: dto.libre_no,
      owner_id: dto.owner_id,
      make: dto.make,
      model: dto.model,
      color: dto.color,
      capacity: dto.capacity,
      status: dto.status,
    });
    return {
      id: v.id,
      plate_number: v.plate_number,
      libre_no: v.libre_no,
      owner_id: v.owner_id,
      association_id: v.association_id,
      make: v.make,
      model: v.model,
      color: v.color,
      capacity: v.capacity,
      status: v.status,
      started_at: v.started_at,     // NEW
      ended_at: v.ended_at,         // NEW
      created_at: v.created_at!,
      updated_at: v.updated_at!,
    };
  }

  @Delete(':id')
  @Roles('Superadmin', 'Admin', 'Association')
  @ApiOperation({ summary: 'Soft delete (marks RETIRED, sets deleted_at and ended_at)' })
  @ApiResponse({ status: 200, schema: { example: { status: 'ok' } } })
  async remove(@Req() req: any, @Param('id', ParseIntPipe) id: number): Promise<{ status: 'ok' }> {
    const association_id = req.context.associationId as number;
    await this.service.deleteVehicle(id, association_id);
    return { status: 'ok' };
  }
}
