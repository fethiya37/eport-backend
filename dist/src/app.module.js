"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const auth_module_1 = require("./presentation/auth/auth.module");
const user_module_1 = require("./presentation/user/user.module");
const association_module_1 = require("./presentation/association/association.module");
const owner_module_1 = require("./presentation/owner/owner.module");
const vehicle_module_1 = require("./presentation/vehicle/vehicle.module");
const driver_module_1 = require("./presentation/driver/driver.module");
const core_1 = require("@nestjs/core");
const jwt_guard_1 = require("./infrastructure/auth/jwt.guard");
const roles_guard_1 = require("./infrastructure/auth/roles.guard");
const route_assignment_module_1 = require("./presentation/route-assignment/route-assignment.module");
const routes_module_1 = require("./presentation/routes/routes.module");
const route_quota_module_1 = require("./presentation/route-quota/route-quota.module");
const association_policy_module_1 = require("./presentation/association-policy/association-policy.module");
const payments_module_1 = require("./presentation/payments/payments.module");
const jobs_module_1 = require("./application/jobs/jobs.module");
const sms_module_1 = require("./presentation/sms/sms.module");
const health_controller_1 = require("./health.controller");
const chapa_subaccount_module_1 = require("./presentation/chapa-subaccount/chapa-subaccount.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            association_module_1.AssociationModule,
            owner_module_1.OwnerModule,
            vehicle_module_1.VehicleModule,
            driver_module_1.DriverModule,
            route_assignment_module_1.RouteAssignmentModule,
            routes_module_1.RoutesModule,
            route_quota_module_1.RouteQuotaModule,
            schedule_1.ScheduleModule.forRoot(),
            association_policy_module_1.AssociationPolicyModule,
            payments_module_1.PaymentsModule,
            jobs_module_1.JobsModule,
            sms_module_1.SmsModule,
            chapa_subaccount_module_1.ChapaSubaccountModule,
        ],
        controllers: [health_controller_1.HealthController],
        providers: [
            { provide: core_1.APP_GUARD, useClass: jwt_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map