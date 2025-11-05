"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteAssignmentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../../infrastructure/auth/jwt.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const route_assignment_service_1 = require("../../application/services/route-assignment.service");
const bulk_upsert_dto_1 = require("./dto/bulk-upsert.dto");
const approve_dto_1 = require("./dto/approve.dto");
const update_assignment_dto_1 = require("./dto/update-assignment.dto");
const find_filter_dto_1 = require("./dto/find-filter.dto");
const visible_coverage_dto_1 = require("./dto/visible-coverage.dto");
let RouteAssignmentController = class RouteAssignmentController {
    service;
    constructor(service) {
        this.service = service;
    }
    bulkUpsert(user, dto) {
        return this.service.bulkUpsert(user, dto);
    }
    approve(user, dto) {
        return this.service.approve(user, dto);
    }
    find(user, filter) {
        return this.service.find(user, filter);
    }
    updateOne(user, id, dto) {
        return this.service.updateOne(user, id, dto);
    }
    remove(user, id) {
        return this.service.remove(user, id);
    }
    visibleCoverage(user, q) {
        return this.service.visibleCoverage(user, q);
    }
};
exports.RouteAssignmentController = RouteAssignmentController;
__decorate([
    (0, common_1.Post)('bulk-upsert'),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin', 'Association'),
    (0, swagger_1.ApiOperation)({ summary: 'Create/update many assignments (GC only)' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, bulk_upsert_dto_1.BulkUpsertAssignmentsDto]),
    __metadata("design:returntype", void 0)
], RouteAssignmentController.prototype, "bulkUpsert", null);
__decorate([
    (0, common_1.Patch)('approve'),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve many assignments' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, approve_dto_1.ApproveAssignmentsDto]),
    __metadata("design:returntype", void 0)
], RouteAssignmentController.prototype, "approve", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin', 'Association'),
    (0, swagger_1.ApiOperation)({ summary: 'List assignments (GC filters)' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, find_filter_dto_1.RouteAssignmentFilterDto]),
    __metadata("design:returntype", void 0)
], RouteAssignmentController.prototype, "find", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin', 'Association'),
    (0, swagger_1.ApiOperation)({ summary: 'Update one assignment (GC only)' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_assignment_dto_1.UpdateAssignmentDto]),
    __metadata("design:returntype", void 0)
], RouteAssignmentController.prototype, "updateOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('Admin', 'Superadmin', 'Association'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete one assignment' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], RouteAssignmentController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('visible-coverage'),
    (0, roles_decorator_1.Roles)('Driver', 'Controller', 'Admin', 'Superadmin'),
    (0, swagger_1.ApiOperation)({
        summary: 'View route assignments from current period start → active_until_date (Approved only), GC in/out, by plate_number or driver_id',
    }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, visible_coverage_dto_1.VisibleCoverageQueryDto]),
    __metadata("design:returntype", void 0)
], RouteAssignmentController.prototype, "visibleCoverage", null);
exports.RouteAssignmentController = RouteAssignmentController = __decorate([
    (0, swagger_1.ApiTags)('route-assignments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('route-assignments'),
    __metadata("design:paramtypes", [route_assignment_service_1.RouteAssignmentService])
], RouteAssignmentController);
//# sourceMappingURL=route-assignment.controller.js.map