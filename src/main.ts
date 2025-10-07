import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  app.enableCors();
  app.setGlobalPrefix('api/v1');
  
 const port = process.env.PORT || 3000;
await app.listen(port, '0.0.0.0');
console.log(`🚀 FlowPay API running on port ${port}`);
}
bootstrap();