import './utils/crypto-polyfill';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, { cors: true });
    const configService = app.get(ConfigService);
    // Инициализация глобальных валидационных пайпов
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    // Применение глобального фильтра исключений
    app.useGlobalFilters(new HttpExceptionFilter());
    const port = configService.get('port');
    await app.listen(port);
    console.log(`Server started on port: ${port}`);
  } catch (error) {
    console.error('Error when starting the server:', error);
    process.exit(1);
  }
}
bootstrap();
