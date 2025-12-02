import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEnabledToAccount1665727898429 implements MigrationInterface {
  name = 'AddEnabledToAccount1665727898429';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`account\`
        ADD \`enabled\` tinyint NOT NULL DEFAULT 1`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`account\` DROP COLUMN \`enabled\``);
  }
}
