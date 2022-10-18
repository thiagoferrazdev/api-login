import {MigrationInterface, QueryRunner} from "typeorm";

export class init1666105163534 implements MigrationInterface {
    name = 'init1666105163534'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "password" text NOT NULL, "updateddate" datetime NOT NULL DEFAULT (datetime('now')), "hach_refresh_token" varchar, CONSTRAINT "UQ_3021ae0235cf9c4a6d59663f859" UNIQUE ("username"))`);
        await queryRunner.query(`INSERT INTO "temporary_user"("id", "username", "password", "updateddate", "hach_refresh_token") SELECT "id", "username", "password", "updateddate", "hach_refresh_token" FROM "user"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_78a916df40e02a9deb1c4b75ed" ON "user" ("username") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_78a916df40e02a9deb1c4b75ed"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer NOT NULL, "username" text NOT NULL, "password" text NOT NULL, "updateddate" datetime NOT NULL, "hach_refresh_token" text NOT NULL)`);
        await queryRunner.query(`INSERT INTO "user"("id", "username", "password", "updateddate", "hach_refresh_token") SELECT "id", "username", "password", "updateddate", "hach_refresh_token" FROM "temporary_user"`);
        await queryRunner.query(`DROP TABLE "temporary_user"`);
    }

}
