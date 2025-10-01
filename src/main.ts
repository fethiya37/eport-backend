import './setup-temporal';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  // Swagger (now at /docs instead of /api/docs)
  const config = new DocumentBuilder()
    .setTitle('Clean Architecture API')
    .setDescription('API documentation for Clean Architecture project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Server running at http://localhost:${process.env.PORT ?? 3000}/api`);
  console.log(`📚 Swagger docs available at http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}
bootstrap();
