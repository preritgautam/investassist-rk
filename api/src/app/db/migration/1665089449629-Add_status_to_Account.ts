import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToAccount1665089449629 implements MigrationInterface {
  name = 'AddStatusToAccount1665089449629';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`account\` ADD \`status\` varchar(255) NOT NULL DEFAULT 'Free'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`account\` DROP COLUMN \`status\``);
  }
}
