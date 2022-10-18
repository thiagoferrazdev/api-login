import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUser1648623447697 implements MigrationInterface {
  name = 'addUser1648623447697';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE user(
        id integer NOT NULL,
        username text NOT NULL,
        password text NOT NULL,
        updateddate datetime NOT NULL, 
        hach_refresh_token text NOT NULL)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
