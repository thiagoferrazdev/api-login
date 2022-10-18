import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getTypeOrmModuleOptions = (): TypeOrmModuleOptions =>
  ({
    type: 'sqlite',
    database: 'src/database/db.sqlite',
    entities: [__dirname + './../../**/*.entity{.ts,.js}'],
    synchronize: false,
    migrationsRun: true,
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    cli: {
      migrationsDir: 'src/migrations',
    },
  } as TypeOrmModuleOptions);

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: getTypeOrmModuleOptions,
    }),
  ],
})
export class TypeOrmConfigModule {}
