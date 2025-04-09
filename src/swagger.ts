import basicAuth from '@fastify/basic-auth';

import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ConfigService } from './config';

/**
 * Setup swagger
 * @param app
 * @param configService
 */
export async function swaggerSetup(
  app: NestFastifyApplication,
  configService: ConfigService,
) {
  if (configService.get('SWAGGER_MODULE')) {
    const config = new DocumentBuilder()
      .setVersion(configService.get('npm_package_version'))
      .setTitle(configService.get('npm_package_name'))
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('/', app, document, {
      swaggerOptions: {
        persistAuthorization: true, // 🔥 Keep JWT tokens after refreshing the page
        displayRequestDuration: true, // ⏳ Show request duration in Swagger UI
        tryItOutEnabled: true, // 🛠️ Enable "Try it out" by default
        filter: true, // 🔎 Add a search bar for API endpoints
        deepLinking: true, // 🔗 Allow direct links to specific API sections
        showExtensions: true, // 📌 Show extra metadata if available
        showCommonExtensions: true, // 🎯 Show common extensions in API docs
      },
    });

    if (configService.get('SWAGGER_LOGIN')) {
      const swaggerUsername = configService.get<string>('SWAGGER_USERNAME');
      const swaggerPassword = configService.get<string>('SWAGGER_PASSWORD');

      await app.register(basicAuth, {
        validate: (username, password, _req, _reply, done) =>
          username === swaggerUsername && password === swaggerPassword
            ? done()
            : done(new Error()),
        authenticate: true,
      });

      const instance: any = app.getHttpAdapter().getInstance();
      instance.addHook('onRequest', (request, reply, done) => {
        return request.url === '/' ||
          request.routeOptions.url.startsWith('/api/v1/logs')
          ? instance.basicAuth(request, reply, done)
          : done();
      });
    }
  }
}
