import './setup-temporal';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/+$/, '').toLowerCase();
}

function buildAllowlist(): Set<string> {
  const raw = process.env.FRONTEND_ALLOWLIST || '';
  const items = raw
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
    .map(normalizeOrigin);

  return new Set(items);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance();

  if (instance && typeof instance.set === 'function') {
    instance.set('trust proxy', 1);
    if (typeof instance.disable === 'function') {
      instance.disable('x-powered-by');
    }
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: true,
      stopAtFirstError: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
    }),
  );

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    next();
  });

  if ((process.env.ENABLE_HSTS || '').toLowerCase() === 'true') {
    app.use((req, res, next) => {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      next();
    });
  }

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.RATE_LIMIT_GLOBAL || 600),
    standardHeaders: true,
    legacyHeaders: false,
  });

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.RATE_LIMIT_LOGIN || 20),
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api', globalLimiter);
  app.use('/api/auth/login', loginLimiter);

  app.setGlobalPrefix('api');

  const allowlist = buildAllowlist();

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const normalized = normalizeOrigin(origin);

      if (allowlist.has(normalized)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'X-Client-Integrity'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 600,
  });

  const config = new DocumentBuilder()
    .setTitle('EPORT API')
    .setDescription('API documentation for EPORT project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  console.log(`🚀 Server running at http://localhost:${port}/api`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
