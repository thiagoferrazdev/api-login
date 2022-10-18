import { ConnectionOptions } from 'typeorm';

const config: ConnectionOptions = {
  type: 'sqlite',
  entities: [__dirname + './../../**/*.entity{.ts,.js}'],
  synchronize: true,
  database: 'src/database/db.sqlite',
  migrationsRun: true,
  migrationsTableName: 'migration_todo',
  migrations: ['database/migrations/**/*{.ts,.js}'],
  cli: {
    migrationsDir: 'database/migrations',
  },
};

console.log(config);

export default config;
