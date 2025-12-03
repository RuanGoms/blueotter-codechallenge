import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter, AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('BlueOtter GitHub Repository API')
    .setDescription(
      'API for managing and analyzing GitHub repositories. Sync user repositories, search, and get statistics.',
    )
    .setVersion('1.0')
    .addTag('sync', 'Sync GitHub repositories to local database')
    .addTag('users', 'User repository management')
    .addTag('repositories', 'Repository search')
    .addTag('statistics', 'Repository statistics and analytics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api-docs`);
}

bootstrap();
