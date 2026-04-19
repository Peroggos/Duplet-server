import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './moduls/user/user.module';
import { AuthModule } from './moduls/auth/auth.module';
import { CategoryModule } from './moduls/category/category.module';
import { PortfolioModule } from './moduls/portfolio/portfolio.module';
import { MassagesModule } from './moduls/massages/massages.module';
import { ConversationsModule } from './moduls/conversations/conversations.module';
import { CardModule } from './moduls/card/card.module';
import { MinioModule } from './moduls/minio/minio.module';


@Module({
  imports: [
    ConfigModule.forRoot({   isGlobal: true }),
     TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),

          synchronize: true,
          entities: [__dirname+ '/**/*.entity{.js, .ts}'],
        }),
        inject: [ConfigService]
      }),

    UserModule,
    AuthModule,
    CategoryModule,
    PortfolioModule,
    MassagesModule,
    ConversationsModule,
    CardModule,
    MinioModule,
    ],

})
export class AppModule {}
