import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserLimitToAccount1682508299502 implements MigrationInterface {
    name = 'AddUserLimitToAccount1682508299502'

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE \`account\` ADD \`userLimit\` int NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE \`account\` DROP COLUMN \`userLimit\``);
    }
}
