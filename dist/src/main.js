"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./setup-temporal");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.setGlobalPrefix('api');
    const allowlist = (process.env.FRONTEND_ALLOWLIST || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (allowlist.includes(origin))
                return callback(null, true);
            return callback(new Error('Not allowed by CORS'), false);
        },
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Clean Architecture API')
        .setDescription('API documentation for Clean Architecture project')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    await app.listen(process.env.PORT ?? 3000);
    console.log(`🚀 Server running at http://localhost:${process.env.PORT ?? 3000}/api`);
    console.log(`📚 Swagger docs available at http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map