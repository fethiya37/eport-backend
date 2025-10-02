"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnerModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../prisma/prisma.module");
const owner_controller_1 = require("./owner.controller");
const owner_service_1 = require("../../application/services/owner.service");
const owner_repository_1 = require("../../domain/repositories/owner.repository");
const prisma_owner_repository_1 = require("../../infrastructure/repositories/prisma-owner.repository");
let OwnerModule = class OwnerModule {
};
exports.OwnerModule = OwnerModule;
exports.OwnerModule = OwnerModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [owner_controller_1.OwnerController],
        providers: [
            owner_service_1.OwnerService,
            { provide: owner_repository_1.OWNER_REPOSITORY, useClass: prisma_owner_repository_1.PrismaOwnerRepository },
        ],
        exports: [owner_service_1.OwnerService],
    })
], OwnerModule);
//# sourceMappingURL=owner.module.js.map