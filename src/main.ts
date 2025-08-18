import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import * as bodyParser from "body-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Increase body-parser limits
  app.use(bodyParser.json({ limit: "100mb" }));
  app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle("NestJS Clean Architecture API")
    .setDescription("API REST CRUD avec NestJS, Prisma et AWS S3")
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  // const port = process.env.PORT || 3000;
  await app.listen(3000, "0.0.0.0");

  console.log(`🚀 Application is running on: http://192.168.1.116:3000}`);
  console.log(`📖 Swagger documentation: http://192.168.1.116:3000/api`);
}

bootstrap();
